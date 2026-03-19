package backend.models;

import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

@Entity
public class User {
    @Id
    private UUID id;
    private String name;
    private String password;

    @ElementCollection
    private List<UUID> publicKeys;

    public User(UUID id, String name, String password) {
        this.id = id;
        this.name = name;
        this.password = password;
    }

    public User() {

    }

    public List<UUID> getPublicKeys() {
        return publicKeys;
    }

    public void setPublicKeys(List<UUID> publicKeys) {
        this.publicKeys = publicKeys;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
