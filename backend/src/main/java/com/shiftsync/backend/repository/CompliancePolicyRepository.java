package com.shiftsync.backend.repository;

import com.shiftsync.backend.model.CompliancePolicy;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompliancePolicyRepository extends JpaRepository<CompliancePolicy, Long> {
    List<CompliancePolicy> findByBranchId(Long branchId);
}
