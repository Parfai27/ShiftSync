package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.SchedulingDtos.AdjustmentRequestPayload;
import com.shiftsync.backend.dto.SchedulingDtos.AdjustmentStatusUpdate;
import com.shiftsync.backend.dto.SchedulingDtos.AvailabilityRequest;
import com.shiftsync.backend.dto.SchedulingDtos.ShiftRequest;
import com.shiftsync.backend.model.Availability;
import com.shiftsync.backend.model.Shift;
import com.shiftsync.backend.model.ShiftAdjustmentRequest;
import com.shiftsync.backend.service.SchedulingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scheduling")
@RequiredArgsConstructor
public class SchedulingController {

    private final SchedulingService schedulingService;

    @GetMapping("/shifts")
    public List<Shift> getShifts() {
        return schedulingService.getShifts();
    }

    @PostMapping("/shifts")
    public Shift createShift(@Valid @RequestBody ShiftRequest request) {
        return schedulingService.createShift(request);
    }

    @PostMapping("/availability")
    public Availability createAvailability(@Valid @RequestBody AvailabilityRequest request) {
        return schedulingService.createAvailability(request);
    }

    @GetMapping("/adjustments")
    public List<ShiftAdjustmentRequest> getAdjustments() {
        return schedulingService.getAdjustments();
    }

    @PostMapping("/adjustments")
    public ShiftAdjustmentRequest createAdjustment(@Valid @RequestBody AdjustmentRequestPayload request) {
        return schedulingService.createAdjustment(request);
    }

    @PatchMapping("/adjustments/{id}")
    public ShiftAdjustmentRequest updateAdjustmentStatus(
        @PathVariable Long id,
        @Valid @RequestBody AdjustmentStatusUpdate request
    ) {
        return schedulingService.updateAdjustmentStatus(id, request);
    }
}
