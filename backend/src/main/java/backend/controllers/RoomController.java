package backend.controllers;

import backend.models.AvailableRoomDTO;
import backend.models.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import backend.services.RoomService;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
public class RoomController {
    @Autowired
    private RoomService roomService;

    @GetMapping("/rooms")
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    @PostMapping("/rooms/available")
    public boolean getAvailableRooms(@RequestBody AvailableRoomDTO availableRoomDTO) {
        UUID uuidPrivateKey;
        if (availableRoomDTO.getPrivateKey().isEmpty()) {
            uuidPrivateKey = null;
        } else {
            uuidPrivateKey = UUID.fromString(availableRoomDTO.getPrivateKey());
        }
        LocalDate parsedDate = LocalDate.parse(availableRoomDTO.getDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return roomService.isRoomAvailable(uuidPrivateKey, availableRoomDTO.getRoomName(), parsedDate, availableRoomDTO.getStartTime(), availableRoomDTO.getEndTime());
    }
}
