package com.shiftsync.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public final class ChatDtos {

    private ChatDtos() {
    }

    public record ChatMessage(
        @NotBlank String role,
        @NotBlank String content
    ) {
    }

    public record ChatRequest(
        Long userId,
        String role,
        String fullName,
        String pathname,
        @NotEmpty List<ChatMessage> messages
    ) {
    }

    public record ChatResponse(
        String reply,
        String topic,
        String route,
        boolean usedFallback
    ) {
    }
}
