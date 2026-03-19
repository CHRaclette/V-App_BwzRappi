package backend.services;

import backend.models.Reservation;
import backend.models.User;
import backend.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import backend.repositories.UserRepository;
import backend.utils.PasswordHasher;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    PasswordHasher passwordHasher = new PasswordHasher();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public User login(String username, String password) {
        User user = userRepository.findByName(username);

        if(user != null) {
            if(passwordHasher.verifyPassword(password, user.getPassword())) {
                user.setPassword("REDACTED");
                return user;
            } else {
                throw new RuntimeException("Invalid password");
            }
        }
        return null;
    }

    public User signup(String username, String password) {
        if (userRepository.findByName(username) != null) {
            throw new RuntimeException("User already exists");
        }

        String hashedPassword = passwordHasher.hashPassword(password);
        User newUser = new User(UUID.randomUUID(), username, hashedPassword);
        return userRepository.save(newUser);
    }

    public List<UUID> getUserPublicKeys(UUID userId) {
        List<Reservation> reservations = reservationRepository.findByUser_Id(userId);

        LocalDate today = LocalDate.now();

        return reservations.stream()
                .filter(reservation -> !reservation.getDate().isBefore(today))
                .map(Reservation::getPublicKey)
                .collect(Collectors.toList());
    }

    public User addPublicKey(UUID userId, UUID publicKey) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            List<UUID> publicKeys = user.getPublicKeys();
            if (!publicKeys.contains(publicKey)) {
                publicKeys.add(publicKey);
                user.setPublicKeys(publicKeys);
                return userRepository.save(user);
            } else {
                throw new RuntimeException("Public key already exists for this user");
            }
        } else {
            throw new RuntimeException("User not found");
        }
    }
}
