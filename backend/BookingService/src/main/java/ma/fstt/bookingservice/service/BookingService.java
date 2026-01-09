package ma.fstt.bookingservice.service;

import ma.fstt.bookingservice.client.AuthServiceClient;
import ma.fstt.bookingservice.repository.BookingRepository;
import ma.fstt.bookingservice.dto.BookingRequestDTO;
import ma.fstt.bookingservice.dto.BookingResponseDTO;
import ma.fstt.bookingservice.response.PropertyDTO;
import ma.fstt.bookingservice.response.WalletStatusDTO;
import ma.fstt.bookingservice.exception.*;
import ma.fstt.bookingservice.model.Booking;
import ma.fstt.bookingservice.model.BookingStatus;
import ma.fstt.bookingservice.client.ListingServiceClient;

import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AuthServiceClient authServiceClient;
    private final ListingServiceClient listingServiceClient;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.confirmed}")
    private String confirmedRoutingKey;

    @Value("${rabbitmq.routing-key.cancelled}")
    private String cancelledRoutingKey;

    @Value("${rabbitmq.routing-key.created}")
    private String createdRoutingKey;

    /**
     * ✅ MODIFIÉ : Récupération automatique du wallet + String tenantId
     * Trust-But-Verify Pattern: Create Booking with strict validation
     * État final : AWAITING_PAYMENT
     */
    @Transactional
    public BookingResponseDTO createBooking(String tenantId, BookingRequestDTO request) {
        log.info("Creating booking for tenant {} - Property {}", tenantId, request.getPropertyId());

        // ✅ Récupérer automatiquement le wallet de l'utilisateur (avec Circuit Breaker)
        String tenantWallet = getConnectedWallet(tenantId);
        log.info("✅ Using connected wallet: {} for tenant {}", tenantWallet, tenantId);

        // Step 1: Validate Dates
        validateDates(request.getStartDate(), request.getEndDate());

        // Step 2: Check Property Availability
        checkAvailability(request.getPropertyId(), request.getStartDate(), request.getEndDate());

        // Step 3: Fetch Current Price from ListingService (Snapshot Pattern + Circuit Breaker)
        PropertyDTO property = fetchPropertyPricing(request.getPropertyId());

        // Step 4: Calculate Total Price
        long numberOfNights = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalPrice = property.getPrice().multiply(BigDecimal.valueOf(numberOfNights));

        log.info("Calculated price: {} nights × {} {} = {} {}",
                numberOfNights, property.getPrice(), property.getCurrency(), totalPrice, property.getCurrency());

        // Step 5: Create Booking with AWAITING_PAYMENT status
        Booking booking = Booking.builder()
                .propertyId(request.getPropertyId())
                .tenantId(tenantId)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(BookingStatus.AWAITING_PAYMENT)
                .tenantWalletAddress(tenantWallet)
                .pricePerNight(property.getPrice())
                .totalPrice(totalPrice)
                .currency(property.getCurrency())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created with ID: {} - Status: AWAITING_PAYMENT", savedBooking.getId());

        // Publier l'événement "booking.created" pour le PaymentService
        rabbitTemplate.convertAndSend(exchange, createdRoutingKey, savedBooking);
        log.info("Published booking.created event for booking {}", savedBooking.getId());

        return mapToResponseDTO(savedBooking);
    }

    /**
     * ✅ Récupère automatiquement le wallet connecté de l'utilisateur
     * 🔄 PROTECTION : Circuit Breaker pour gérer l'indisponibilité d'AuthService
     *
     * @param userId ID de l'utilisateur (String UUID)
     * @return Adresse du wallet connecté
     * @throws WalletNotConnectedException Si l'utilisateur n'a pas de wallet connecté
     * @throws ServiceUnavailableException Si AuthService est indisponible (fallback)
     */
    @CircuitBreaker(name = "authService", fallbackMethod = "getWalletFallback")
    private String getConnectedWallet(String userId) {
        log.debug("🔍 Fetching connected wallet for user {}", userId);

        try {
            WalletStatusDTO walletStatus = authServiceClient.getWalletStatus(userId);

            if (!walletStatus.getExists()) {
                log.warn("❌ User {} does not have a connected wallet", userId);
                throw new WalletNotConnectedException(
                        "You must connect your wallet before creating a booking. " +
                                "Please go to your profile settings and connect your Web3 wallet (MetaMask, etc.)."
                );
            }

            log.info("✅ Wallet found for user {}: {}", userId, walletStatus.getWalletAddress());
            return walletStatus.getWalletAddress();

        } catch (FeignException.NotFound e) {
            log.error("❌ User {} not found in AuthService", userId);
            throw new BookingException("User not found. Please contact support.");

        } catch (FeignException e) {
            log.error("❌ Error communicating with AuthService: {}", e.getMessage());
            throw new BookingException(
                    "Unable to verify wallet connection. Please try again later.", e
            );
        }
    }

    /**
     * ✅ FALLBACK : Méthode de secours si AuthService est indisponible
     * Appelée automatiquement par le Circuit Breaker
     */
    private String getWalletFallback(String userId, Exception e) {
        log.error("❌ AuthService circuit breaker activated for user {}: {}", userId, e.getMessage());
        throw new ServiceUnavailableException(
                "Authentication service is temporarily unavailable. Please try again later."
        );
    }

    /**
     * 🔒 MÉTHODE SÉCURISÉE : Confirmation après validation du paiement
     * Cette méthode NE DOIT JAMAIS être appelée directement par le Frontend
     * Elle est destinée au PaymentService via RabbitMQ ou appel interne
     */
    @Transactional
    public BookingResponseDTO confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        // ⚠️ VALIDATION STRICTE DES ÉTATS
        if (booking.getStatus() != BookingStatus.AWAITING_PAYMENT) {
            log.error("Illegal state transition attempted: {} -> CONFIRMED for booking {}",
                    booking.getStatus(), bookingId);
            throw new BookingException(
                    String.format("Cannot confirm booking in status %s. Only AWAITING_PAYMENT bookings can be confirmed.",
                            booking.getStatus())
            );
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking confirmedBooking = bookingRepository.save(booking);

        // Publier l'événement de confirmation
        rabbitTemplate.convertAndSend(exchange, confirmedRoutingKey, confirmedBooking);
        log.info("Booking {} confirmed - Published confirmation event", bookingId);

        return mapToResponseDTO(confirmedBooking);
    }

    /**
     * ✅ SÉCURISÉ : Cancel a booking avec validation stricte des statuts
     *
     * RÈGLES MÉTIER :
     * - AWAITING_PAYMENT → CANCELLED ✅ (pas encore payé, annulation simple)
     * - CONFIRMED → CANCELLED ✅ (payé, nécessite remboursement)
     * - CANCELLED → Exception ❌ (déjà annulé)
     * - EXPIRED → Exception ❌ (déjà expiré)
     */
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        // ❌ Impossible d'annuler si déjà dans un état final
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            log.warn("Attempted to cancel already cancelled booking {}", bookingId);
            throw new BookingException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.EXPIRED) {
            log.warn("Attempted to cancel expired booking {}", bookingId);
            throw new BookingException("Booking has expired and cannot be cancelled");
        }

        // ⚠️ CRITIQUE : Si CONFIRMED, déclencher le processus de remboursement
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            log.warn("⚠️ Cancelling CONFIRMED booking {} - Refund process should be initiated", bookingId);
            log.info("Cancellation of confirmed booking allowed - Manual refund may be required");
        }

        // ✅ Transition autorisée
        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);

        // Publier l'événement d'annulation
        rabbitTemplate.convertAndSend(exchange, cancelledRoutingKey, cancelledBooking);
        log.info("Booking {} cancelled from status {} - Published cancellation event",
                bookingId, previousStatus);

        return mapToResponseDTO(cancelledBooking);
    }

    /**
     * 🕐 MÉTHODE POUR LE SCHEDULER : Expirer les paiements non payés
     * Transition : AWAITING_PAYMENT → EXPIRED (après 15 min)
     */
    @Transactional
    public void expireUnpaidBookings() {
        log.info("Running expiration job for unpaid bookings...");
        // TODO: Implémenté dans BookingExpirationScheduler
    }

    // ========== MÉTHODES DE VALIDATION ==========

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if (startDate.isBefore(today)) {
            throw new BookingException("Start date cannot be in the past");
        }

        if (endDate.isBefore(startDate) || endDate.isEqual(startDate)) {
            throw new BookingException("End date must be after start date");
        }

        long nights = ChronoUnit.DAYS.between(startDate, endDate);
        if (nights < 1) {
            throw new BookingException("Booking must be at least 1 night");
        }
    }

    private void checkAvailability(Long propertyId, LocalDate startDate, LocalDate endDate) {
        // On considère aussi AWAITING_PAYMENT comme "bloquant"
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.AWAITING_PAYMENT,
                BookingStatus.CONFIRMED
        );

        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                propertyId, startDate, endDate, activeStatuses
        );

        if (!overlappingBookings.isEmpty()) {
            log.warn("Property {} is not available for dates {} to {}", propertyId, startDate, endDate);
            throw new PropertyNotAvailableException(
                    "Property is already booked for the selected dates"
            );
        }
    }

    /**
     * ✅ Fetch property pricing avec Circuit Breaker
     * 🔄 PROTECTION : Circuit Breaker pour gérer l'indisponibilité de ListingService
     */
    @CircuitBreaker(name = "listingService", fallbackMethod = "getPropertyFallback")
    private PropertyDTO fetchPropertyPricing(Long propertyId) {
        try {
            PropertyDTO property = listingServiceClient.getProperty(propertyId);

            if (property.getPrice() == null || property.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BookingException("Property does not have a valid price");
            }

            log.info("Fetched property pricing: {} {}/night", property.getPrice(), property.getCurrency());
            return property;

        } catch (FeignException.NotFound e) {
            throw new PropertyNotFoundException("Property not found with ID: " + propertyId);
        } catch (FeignException e) {
            log.error("Error fetching property pricing: {}", e.getMessage());
            throw new BookingException("Unable to fetch property details", e);
        }
    }

    /**
     * ✅ FALLBACK : Méthode de secours si ListingService est indisponible
     * Appelée automatiquement par le Circuit Breaker
     */
    private PropertyDTO getPropertyFallback(Long propertyId, Exception e) {
        log.error("❌ ListingService circuit breaker activated for property {}: {}",
                propertyId, e.getMessage());
        throw new ServiceUnavailableException(
                "Property service is temporarily unavailable. Please try again later."
        );
    }

    /**
     * ✅ Get bookings by tenant
     */
    public List<BookingResponseDTO> getBookingsByTenant(String tenantId) {
        return bookingRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    /**
     * ✅ Get booking by ID
     */
    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));
        return mapToResponseDTO(booking);
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .propertyId(booking.getPropertyId())
                .tenantId(booking.getTenantId())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .tenantWalletAddress(booking.getTenantWalletAddress())
                .pricePerNight(booking.getPricePerNight())
                .totalPrice(booking.getTotalPrice())
                .currency(booking.getCurrency())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}