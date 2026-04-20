package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.SchedulingDtos.AdjustmentRequestPayload;
import com.shiftsync.backend.dto.SchedulingDtos.AdjustmentStatusUpdate;
import com.shiftsync.backend.dto.SchedulingDtos.AvailabilityRequest;
import com.shiftsync.backend.dto.SchedulingDtos.ShiftRequest;
import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.model.Availability;
import com.shiftsync.backend.model.Branch;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAdjustmentRequest;
import com.shiftsync.backend.model.ShiftStatus;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.AvailabilityRepository;
import com.shiftsync.backend.repository.BranchRepository;
import com.shiftsync.backend.repository.ShiftAdjustmentRequestRepository;
import com.shiftsync.backend.repository.ShiftRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final ShiftRepository shiftRepository;
    private final BranchRepository branchRepository;
    private final AvailabilityRepository availabilityRepository;
    private final ShiftAdjustmentRequestRepository adjustmentRepository;
    private final UserRepository userRepository;

    public List<Shift> getShifts() {
        return shiftRepository.findAll();
    }

    public Shift createShift(ShiftRequest request) {
        Branch branch = branchRepository.findById(request.branchId())
            .orElseThrow(() -> new IllegalArgumentException("Branch not found"));

        Shift shift = Shift.builder()
            .name(request.name())
            .branch(branch)
            .shiftDate(request.shiftDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .requiredStaff(request.requiredStaff())
            .assignedStaff(0)
            .status(ShiftStatus.DRAFT)
            .build();

        return shiftRepository.save(shift);
    }

    public Availability createAvailability(AvailabilityRequest request) {
        User employee = userRepository.findById(request.employeeId())
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Availability availability = Availability.builder()
            .employee(employee)
            .availableDate(request.availableDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .status(request.status())
            .notes(request.notes())
            .build();

        return availabilityRepository.save(availability);
    }

    public ShiftAdjustmentRequest createAdjustment(AdjustmentRequestPayload request) {
        User employee = userRepository.findById(request.employeeId())
            .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        Shift shift = shiftRepository.findById(request.shiftId())
            .orElseThrow(() -> new IllegalArgumentException("Shift not found"));

        ShiftAdjustmentRequest adjustment = ShiftAdjustmentRequest.builder()
            .employee(employee)
            .shift(shift)
            .adjustmentType(request.adjustmentType())
            .requestedChange(request.requestedChange())
            .status(AdjustmentStatus.PENDING)
            .build();

        return adjustmentRepository.save(adjustment);
    }

    public List<ShiftAdjustmentRequest> getAdjustments() {
        return adjustmentRepository.findAll();
    }

    public ShiftAdjustmentRequest updateAdjustmentStatus(Long id, AdjustmentStatusUpdate request) {
        ShiftAdjustmentRequest adjustment = adjustmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Adjustment not found"));

        adjustment.setStatus(request.status());
        adjustment.setReviewedAt(LocalDateTime.now());
        return adjustmentRepository.save(adjustment);
    }
}
