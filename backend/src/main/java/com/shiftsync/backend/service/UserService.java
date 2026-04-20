package com.shiftsync.backend.service;

import com.shiftsync.backend.model.Role;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getEmployees() {
        return userRepository.findByRole(Role.EMPLOYEE);
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
