package backend.services;

import backend.models.Reservation;
import backend.models.Room;
import backend.models.User;
import backend.repositories.ReservationRepository;
import backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {
    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Reservation> getReservationsByUser(UUID userID) {
        return reservationRepository.findByUser_Id(userID);
    }

    public void deleteReservation(UUID privateKey) {
        Reservation reservation = reservationRepository.findByPrivateKey(privateKey);
        if (reservation != null) {
            reservation.setPublicKey(null);
            reservationRepository.delete(reservation);
        }
    }


    public Reservation updateReservation(
            UUID privateKey,
            Room room,
            LocalDate date,
            Time startTime,
            Time endTime,
            String comments,
            String participants,
            UUID userId
    ) {
        Reservation reservation = reservationRepository.findByPrivateKey(privateKey);

        if (reservation == null) {
            Reservation newReservation = new Reservation();
            newReservation.setId(UUID.randomUUID());
            newReservation.setPrivateKey(privateKey);
            newReservation.setPublicKey(UUID.randomUUID());
            newReservation.setRoom(room);
            newReservation.setDate(date);
            newReservation.setStartTime(startTime);
            newReservation.setEndTime(endTime);
            newReservation.setComments(comments);
            newReservation.setParticipants(participants);
            newReservation.setUser(userRepository.findById(userId).orElse(null));
            return reservationRepository.save(newReservation);
        } else {
            reservation.setRoom(room);
            reservation.setDate(date);
            reservation.setStartTime(startTime);
            reservation.setEndTime(endTime);
            reservation.setComments(comments);
            reservation.setParticipants(participants);
        }

        return reservationRepository.save(reservation);
    }
    public Reservation getReservationByPrivateKey(UUID privateKey) {
        return reservationRepository.findByPrivateKey(privateKey);
    }

    public Reservation getReservationByPublicKey(UUID publicKey) {
        return reservationRepository.findByPublicKey(publicKey);
    }
}
