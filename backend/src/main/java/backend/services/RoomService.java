package backend.services;

import backend.models.Reservation;
import backend.models.Room;
import backend.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import backend.repositories.ReservationRepository;

import java.sql.Time;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomByName(String name) {
        return roomRepository.findByName(name);
    }

    public boolean isRoomAvailable(UUID uuidPrivateKey, String name, LocalDate parsedDate, Time parsedStartTime, Time parsedEndTime) {
        Room room = roomRepository.findByName(name);
        if (room == null) {
            throw new IllegalArgumentException("Room with name '" + name + "' does not exist.");
        }

        if (uuidPrivateKey != null) {
            Reservation reservationCheck = reservationRepository.findByPrivateKey(uuidPrivateKey);
            System.out.println(reservationCheck.getPrivateKey());
            if (reservationCheck != null && reservationCheck.getRoom().getName().equals(name)
                    && reservationCheck.getDate().equals(parsedDate)
                    && !(reservationCheck.getEndTime().before(parsedStartTime) || reservationCheck.getStartTime().after(parsedEndTime))) {
                return true;
            }
        }

        List<Reservation> conflictingReservations = reservationRepository.findByRoom_IdAndDate(room.getId(), parsedDate)
                .stream()
                .filter(reservation ->
                        !(reservation.getEndTime().before(parsedStartTime) || reservation.getStartTime().after(parsedEndTime))
                )
                .toList();

        return conflictingReservations.isEmpty();
    }
}
