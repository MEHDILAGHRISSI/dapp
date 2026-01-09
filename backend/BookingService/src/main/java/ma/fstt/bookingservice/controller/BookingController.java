package ma.fstt.bookingservice.controller;

import ma.fstt.bookingservice.dto.BookingRequestDTO;
import ma.fstt.bookingservice.dto.BookingResponseDTO;
import ma.fstt.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking
     * État créé : AWAITING_PAYMENT
     * Le frontend recevra le bookingId et totalPrice pour initier le paiement
     *
     * ✅ CORRECTION : tenantId reçu comme String (UUID) du Gateway
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @RequestHeader(value = "X-User-Id", required = true) String tenantId,
            @Valid @RequestBody BookingRequestDTO request
    ) {
        log.info("Received booking request from tenant {}", tenantId);
        BookingResponseDTO response = bookingService.createBooking(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Cancel a booking (peut être appelé par l'utilisateur)
     * ✅ SÉCURISÉ : Vérification de propriété implémentée
     */
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = true) String tenantId
    ) {
        log.info("Cancelling booking {} by tenant {}", bookingId, tenantId);

        // ✅ Vérifier que l'utilisateur est le propriétaire de la réservation
        BookingResponseDTO booking = bookingService.getBookingById(bookingId);

        if (!booking.getTenantId().equals(tenantId)) {
            log.warn("Unauthorized cancellation attempt: booking {} by user {}",
                    bookingId, tenantId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        BookingResponseDTO response = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all bookings for the authenticated tenant
     * ✅ CORRECTION : tenantId reçu comme String
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @RequestHeader(value = "X-User-Id", required = true) String tenantId
    ) {
        log.info("Fetching bookings for tenant {}", tenantId);
        List<BookingResponseDTO> bookings = bookingService.getBookingsByTenant(tenantId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get a specific booking by ID
     * ✅ SÉCURISÉ : Vérification de propriété implémentée
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = true) String tenantId
    ) {
        log.info("Fetching booking {} by tenant {}", bookingId, tenantId);

        BookingResponseDTO booking = bookingService.getBookingById(bookingId);

        // ✅ Vérifier que l'utilisateur a le droit de voir cette réservation
        if (!booking.getTenantId().equals(tenantId)) {
            log.warn("Unauthorized access attempt: booking {} by user {}",
                    bookingId, tenantId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        return ResponseEntity.ok(booking);
    }
}