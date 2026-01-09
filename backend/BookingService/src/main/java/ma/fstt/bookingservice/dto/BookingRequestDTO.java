package ma.fstt.bookingservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

/**
 * DTO for creating a new booking
 *
 * ✅ MODIFICATION : tenantWalletAddress supprimé
 * Le wallet sera récupéré automatiquement depuis AuthService
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDTO {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    // ❌ SUPPRIMÉ : private String tenantWalletAddress;
    // Le wallet est maintenant récupéré automatiquement via AuthService
}