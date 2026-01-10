package ma.fstt.bookingservice.repository;

import ma.fstt.bookingservice.model.Booking;
import ma.fstt.bookingservice.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Trouve les réservations dans un statut donné créées avant une certaine date.
     * Utilisé par le scheduler pour trouver les réservations AWAITING_PAYMENT expirées.
     */
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime createdAt);

    /**
     * Check if there are any overlapping bookings for a property
     * Overlapping logic: New booking conflicts if:
     * - New start is before existing end AND new end is after existing start
     */
    @Query("SELECT b FROM Booking b WHERE b.propertyId = :propertyId " +
            "AND b.status IN :statuses " +
            "AND b.startDate < :endDate " +
            "AND b.endDate > :startDate")
    List<Booking> findOverlappingBookings(
            @Param("propertyId") Long propertyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<BookingStatus> statuses
    );

    List<Booking> findByTenantId(String tenantId);

    List<Booking> findByPropertyId(Long propertyId);

    /**
     * ⚠️ ATTENTION: Cette query NE PEUT PAS fonctionner car Booking n'a pas de relation @ManyToOne avec Property!
     * Booking a seulement propertyId (Long), pas d'objet Property.
     *
     * SOLUTION: On ne peut pas compter directement via cette query.
     * Il faut soit:
     * 1. Ajouter une relation @ManyToOne dans Booking vers Property (pas recommandé - microservices)
     * 2. Faire la vérification différemment dans le service
     *
     * Pour l'instant, on retourne toujours 0 (pas de réservations futures)
     * Cette méthode sera implémentée dans le service avec un appel à ListingService
     */
    // ❌ CETTE QUERY NE FONCTIONNE PAS:
    // @Query("SELECT COUNT(b) FROM Booking b WHERE b.property.owner.userId = :hostId AND b.startDate > :today")
    // Long countByPropertyOwnerIdAndStartDateAfter(@Param("hostId") String hostId, @Param("today") LocalDate today);

    /**
     * ✅ WORKAROUND: Compter les réservations futures par propertyId
     * Le service fera d'abord un appel à ListingService pour récupérer les propertyIds du host
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.propertyId = :propertyId AND b.startDate > :today")
    Long countFutureBookingsByPropertyId(@Param("propertyId") Long propertyId, @Param("today") LocalDate today);

    /**
     * ✅ Compter les réservations actives d'un client
     * ATTENTION: Utilise seulement CONFIRMED (ONGOING n'existe pas dans BookingStatus!)
     */
    Long countByTenantIdAndStatusIn(String tenantId, List<BookingStatus> statuses);


}