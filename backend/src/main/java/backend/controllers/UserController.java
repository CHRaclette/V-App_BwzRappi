package backend.controllers;

import backend.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import backend.services.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public User login(@RequestParam String username, @RequestParam String password) {
        return userService.login(username, password);
    }

    @PostMapping("/signup")
    public User signup(@RequestParam String username, @RequestParam String password) {
        return userService.signup(username, password);
    }

    @GetMapping("/publicKeys")
    public ResponseEntity<List<UUID>> getUserPublicKeys(@RequestParam String userId) {
        UUID userUUID = UUID.fromString(userId);
        List<UUID> publicKeys = userService.getUserPublicKeys(userUUID);
        return ResponseEntity.ok(publicKeys);
    }

    @PatchMapping("/addPublicKey")
    public ResponseEntity<?> addPublicKey(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String publicKey = payload.get("publicKey");

        UUID userUUID;
        UUID publicKeyUUID;
        try {
            userUUID = UUID.fromString(userId);
            publicKeyUUID = UUID.fromString(publicKey);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid UUID format for userId or publicKey");
        }

        try {
            User user = userService.addPublicKey(userUUID, publicKeyUUID);
            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Public key added successfully.");
                response.put("publicKey", publicKey);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
