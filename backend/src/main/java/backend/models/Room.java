package backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
public class Room {
    @Id
    private UUID id;
    private int roomNumber;
    private String name;
    private boolean hasProjector;
    private boolean hasWhiteboard;
    private boolean hasTouchscreen;
    private boolean hasCamera;

    public Room(UUID id, int roomNumber, String name, boolean hasProjector, boolean hasWhiteboard, boolean hasTouchscreen, boolean hasCamera) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.name = name;
        this.hasProjector = hasProjector;
        this.hasWhiteboard = hasWhiteboard;
        this.hasTouchscreen = hasTouchscreen;
        this.hasCamera = hasCamera;
    }

    public Room() {

    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(int roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isHasProjector() {
        return hasProjector;
    }

    public void setHasProjector(boolean hasProjector) {
        this.hasProjector = hasProjector;
    }

    public boolean isHasWhiteboard() {
        return hasWhiteboard;
    }

    public void setHasWhiteboard(boolean hasWhiteboard) {
        this.hasWhiteboard = hasWhiteboard;
    }

    public boolean isHasTouchscreen() {
        return hasTouchscreen;
    }

    public void setHasTouchscreen(boolean hasTouchscreen) {
        this.hasTouchscreen = hasTouchscreen;
    }

    public boolean isHasCamera() {
        return hasCamera;
    }

    public void setHasCamera(boolean hasCamera) {
        this.hasCamera = hasCamera;
    }
}
