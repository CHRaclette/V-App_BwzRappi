package backend.repositories;

import backend.models.Reservation;
import backend.models.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Time;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByUser_Id(UUID userId);
    Reservation findByPrivateKey(UUID privateKey);

    Collection<Reservation> findByRoom_IdAndDate(UUID id, LocalDate parsedDate);

    Reservation findByPublicKey(UUID publicKey);
}