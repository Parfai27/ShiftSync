package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.DeletedSeedEmployee;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeletedSeedEmployeeRepository extends JpaRepository<DeletedSeedEmployee, Long> {
    boolean existsByUsername(String username);

    Optional<DeletedSeedEmployee> findByUsername(String username);
}
