package ma.fstt.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO pour récupérer les informations d'une réservation depuis BookingService
 *
 * Utilisé par le PaymentController pour valider que:
 * - L'utilisateur est bien le tenant de la réservation
 * - La réservation est en statut AWAITING_PAYMENT
 *
 * ⚠️ Ce DTO doit correspondre au BookingResponseDTO du BookingService
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {

    /**
     * ID de la réservation
     */
    private Long id;

    /**
     * ID de la propriété réservée
     */
    private Long propertyId;

    /**
     * ID du locataire (UUID String)
     * Utilisé pour valider l'autorisation
     */
    private String tenantId;

    /**
     * Date de début (check-in)
     */
    private LocalDate startDate;

    /**
     * Date de fin (check-out)
     */
    private LocalDate endDate;

    /**
     * Statut de la réservation
     * Doit être "AWAITING_PAYMENT" pour valider un paiement
     */
    private String status;

    /**
     * Wallet address du tenant (snapshot)
     */
    private String tenantWalletAddress;

    /**
     * Prix par nuit (snapshot)
     */
    private BigDecimal pricePerNight;

    /**
     * Prix total de la réservation
     */
    private BigDecimal totalPrice;

    /**
     * Devise (MAD, MATIC, etc.)
     */
    private String currency;

    /**
     * Date de création
     */
    private LocalDateTime createdAt;

    /**
     * Date de dernière modification
     */
    private LocalDateTime updatedAt;
}