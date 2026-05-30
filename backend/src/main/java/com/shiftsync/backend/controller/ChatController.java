package com.shiftsync.backend.controller;

import com.shiftsync.backend.dto.ChatDtos.ChatRequest;
import com.shiftsync.backend.dto.ChatDtos.ChatResponse;
import com.shiftsync.backend.service.ChatAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatAssistantService chatAssistantService;

    @PostMapping("/message")
    public ChatResponse message(@Valid @RequestBody ChatRequest request) {
        return chatAssistantService.reply(request);
    }
}
