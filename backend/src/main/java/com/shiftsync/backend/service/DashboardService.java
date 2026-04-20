package com.shiftsync.backend.service;

import com.shiftsync.backend.dto.DashboardDtos.AdjustmentSummary;
import com.shiftsync.backend.dto.DashboardDtos.MetricCard;
import com.shiftsync.backend.dto.DashboardDtos.OverviewResponse;
import com.shiftsync.backend.dto.DashboardDtos.ShiftStatusCard;
import com.shiftsync.backend.model.AdjustmentStatus;
import com.shiftsync.backend.repository.ShiftAdjustmentRequestRepository;
import com.shiftsync.backend.repository.ShiftRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final ShiftAdjustmentRequestRepository adjustmentRepository;

    public OverviewResponse getOverview() {
        List<MetricCard> metrics = List.of(
            new MetricCard("Total Employees", String.valueOf(userRepository.count()), "+2.4%"),
            new MetricCard("Active Shifts", String.valueOf(shiftRepository.count()), "LIVE"),
            new MetricCard("Coverage %", "96.5%", "Optimal"),
            new MetricCard("Pending Adjustments", String.valueOf(adjustmentRepository.findByStatus(AdjustmentStatus.PENDING).size()), "Review")
        );

        List<ShiftStatusCard> shiftStatuses = shiftRepository.findAll().stream()
            .limit(3)
            .map(shift -> new ShiftStatusCard(
                shift.getName(),
                shift.getStartTime() + " - " + shift.getEndTime(),
                shift.getAssignedStaff() + "/" + shift.getRequiredStaff(),
                shift.getStatus().name()
            ))
            .toList();

        List<AdjustmentSummary> recentAdjustments = adjustmentRepository.findAll().stream()
            .limit(5)
            .map(item -> new AdjustmentSummary(
                item.getEmployee().getFullName(),
                item.getAdjustmentType(),
                item.getShift().getName(),
                item.getRequestedChange(),
                item.getStatus().name()
            ))
            .toList();

        return new OverviewResponse(metrics, shiftStatuses, recentAdjustments);
    }
}
