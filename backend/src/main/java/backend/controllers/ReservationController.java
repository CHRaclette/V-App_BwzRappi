package backend.controllers;

import backend.models.Reservation;
import backend.models.ReservationUpdateDTO;
import backend.models.Room;
import backend.models.User;
import backend.services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import backend.services.ReservationService;

import java.sql.Time;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
public class ReservationController {
    @Autowired
    private ReservationService reservationService;
    @Autowired
    private RoomService roomService;

    @GetMapping("/reservations")
    public List<Reservation> login(@RequestParam UUID userID) {
        return reservationService.getReservationsByUser(userID);
    }

    @GetMapping("/reservations/prvKey")
    public Reservation getReservationPrivateKey(@RequestParam String privateKey) {
        UUID uuidPrivateKey = UUID.fromString(privateKey);
        return reservationService.getReservationByPrivateKey(uuidPrivateKey);
    }

    @GetMapping("/reservations/pubKey")
    public Reservation getReservationPublicKey(@RequestParam String publicKey) {
        UUID uuidPublicKey = UUID.fromString(publicKey);
        return reservationService.getReservationByPublicKey(uuidPublicKey);
    }

    @PatchMapping("/reservations")
    public Reservation updateReservation(@RequestBody ReservationUpdateDTO dto) {
        LocalDate parsedDate = LocalDate.parse(dto.getDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        UUID uuidPrivateKey = dto.getPrivateKey() == null || dto.getPrivateKey().isEmpty()
                ? UUID.randomUUID()
                : UUID.fromString(dto.getPrivateKey());

        UUID uuidUserId = UUID.fromString(dto.getUserId());

        return reservationService.updateReservation(
                uuidPrivateKey,
                roomService.getRoomByName(dto.getRoomName()),
                parsedDate,
                dto.getStartTime(),
                dto.getEndTime(),
                dto.getComments(),
                dto.getParticipants(),
                uuidUserId
        );
    }

    @DeleteMapping("/reservations")
    public void deleteReservation(@RequestParam String privateKey) {
            UUID uuidPrivateKey = UUID.fromString(privateKey);
            reservationService.deleteReservation(uuidPrivateKey);

    }
}
