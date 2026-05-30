package com.shiftsync.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shiftsync.backend.dto.ChatDtos.ChatMessage;
import com.shiftsync.backend.dto.ChatDtos.ChatRequest;
import com.shiftsync.backend.dto.ChatDtos.ChatResponse;
import com.shiftsync.backend.model.SystemSetting;
import com.shiftsync.backend.model.User;
import com.shiftsync.backend.repository.SystemSettingRepository;
import com.shiftsync.backend.repository.UserRepository;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatAssistantService {

    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.base-url:https://api.openai.com/v1}")
    private String aiBaseUrl;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String aiModel;

    @Value("${app.ai.api-key:}")
    private String aiApiKey;

    @Value("${app.ai.timeout-seconds:30}")
    private int aiTimeoutSeconds;

    public ChatResponse reply(ChatRequest request) {
        String latestUserMessage = latestUserMessage(request.messages());
        if (latestUserMessage == null || latestUserMessage.isBlank()) {
            throw new IllegalArgumentException("A chat message is required.");
        }

        Optional<User> user = request.userId() == null
            ? Optional.empty()
            : userRepository.findById(request.userId());

        String route = inferRoute(latestUserMessage);
        String topic = inferTopic(latestUserMessage);

        if (aiApiKey == null || aiApiKey.isBlank()) {
            log.warn("Chat assistant is using fallback because SHIFT_SYNC_AI_API_KEY is blank.");
            return fallbackResponse(request, user.orElse(null), latestUserMessage, topic, route);
        }

        RuntimeAiConfig runtimeConfig = resolveRuntimeAiConfig();
        try {
            String reply = callModel(request, user.orElse(null), runtimeConfig);
            return new ChatResponse(reply, topic, route, false);
        } catch (Exception exception) {
            log.error(
                "Chat assistant fell back after AI request failure. model={}, baseUrl={}, message={}",
                runtimeConfig.model(),
                runtimeConfig.baseUrl(),
                exception.getMessage(),
                exception
            );
            return fallbackResponse(request, user.orElse(null), latestUserMessage, topic, route);
        }
    }

    private String callModel(ChatRequest request, User user, RuntimeAiConfig runtimeConfig) throws IOException, InterruptedException {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", buildSystemPrompt(request, user)));

        for (ChatMessage message : trimmedHistory(request.messages())) {
            messages.add(Map.of(
                "role", normalizeRole(message.role()),
                "content", message.content().trim()
            ));
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", runtimeConfig.model());
        payload.put("temperature", 0.35);
        payload.put("messages", messages);

        String responseJson = sendChatCompletion(payload, runtimeConfig);
        JsonNode root = objectMapper.readTree(responseJson);
        JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
        String content = contentNode.isTextual() ? contentNode.asText().trim() : "";

        if (content.isBlank()) {
            throw new IllegalStateException("No assistant reply was returned by the model.");
        }

        return content;
    }

    private String sendChatCompletion(Map<String, Object> payload, RuntimeAiConfig runtimeConfig) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(Math.max(5, aiTimeoutSeconds)))
            .build();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(runtimeConfig.baseUrl().endsWith("/") ? runtimeConfig.baseUrl() + "chat/completions" : runtimeConfig.baseUrl() + "/chat/completions"))
            .timeout(Duration.ofSeconds(Math.max(5, aiTimeoutSeconds)))
            .header("Authorization", "Bearer " + aiApiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException(
                "AI provider returned " + response.statusCode() + " with body: " + response.body()
            );
        }

        return response.body();
    }

    private RuntimeAiConfig resolveRuntimeAiConfig() {
        Optional<SystemSetting> maybeSetting = systemSettingRepository.findTopByOrderByIdAsc();
        String resolvedBaseUrl = maybeSetting
            .map(SystemSetting::getAiBaseUrl)
            .filter(value -> value != null && !value.isBlank())
            .orElse(aiBaseUrl);
        String resolvedModel = maybeSetting
            .map(SystemSetting::getAiModel)
            .filter(value -> value != null && !value.isBlank())
            .orElse(aiModel);

        return new RuntimeAiConfig(resolvedBaseUrl, resolvedModel);
    }

    private ChatResponse fallbackResponse(ChatRequest request, User user, String latestUserMessage, String topic, String route) {
        String normalized = normalize(latestUserMessage);
        String contextPrefix = conversationalPrefix(user, request.role(), request.pathname());

        if (containsAny(normalized, "hello", "hi", "hey", "good morning", "good afternoon", "good evening")) {
            return new ChatResponse(
                contextPrefix + "Hello. I'm here with you. I can chat normally, and I can also help with ShiftSync whenever you need it.",
                "Greeting",
                null,
                true
            );
        }

        if (containsAny(normalized, "how are you", "how are you doing", "how is your day")) {
            return new ChatResponse(
                contextPrefix + "I'm doing well and ready to help. If you want, we can talk casually or jump into anything you need help with.",
                "Conversation",
                null,
                true
            );
        }

        if (containsAny(normalized, "who are you", "what are you", "introduce yourself")) {
            return new ChatResponse(
                "I'm ShiftSync Assistant. I can help with the ShiftSync system, and I can also keep up a normal conversation when you just want to talk or think something through.",
                "About the assistant",
                null,
                true
            );
        }

        if (containsAny(normalized, "what can you do", "how can you help")) {
            return new ChatResponse(
                "I can explain ShiftSync features like scheduling, payroll, notifications, reports, compliance, swaps, and login. I can also handle normal day-to-day conversation, help you think through something, or answer general questions.",
                "Capabilities",
                null,
                true
            );
        }

        if (containsAny(normalized, "thank you", "thanks", "thank u")) {
            return new ChatResponse(
                "You're welcome. If you want, keep going and ask me anything else.",
                "Conversation",
                null,
                true
            );
        }

        if (containsAny(normalized, "help me plan my day", "plan my day", "organize my day", "organise my day")) {
            return new ChatResponse(
                "A simple way to plan your day is to split it into three parts: your must-do tasks, the important tasks that would feel good to finish, and anything flexible. Start with one clear priority, give it a time block, and leave some buffer time so the day does not feel too tight. If you want, tell me what you need to get done and I can help you structure it.",
                "Planning help",
                null,
                true
            );
        }

        if (containsAny(normalized, "i am tired", "i'm tired", "feeling tired", "stressed", "overwhelmed")) {
            return new ChatResponse(
                "That sounds heavy. It may help to pause for a moment, pick just one small next step, and lower the pressure to solve everything at once. If you want, tell me what is weighing on you and we can sort it out together.",
                "Support",
                null,
                true
            );
        }

        if (containsAny(normalized, "tell me a joke", "joke", "make me laugh")) {
            return new ChatResponse(
                "Here is one: Why did the schedule stay calm? Because it finally found some balance.",
                "Conversation",
                null,
                true
            );
        }

        if (containsAny(normalized, "what is this system", "what is shiftsync", "about this system", "what does this system do")) {
            return new ChatResponse(
                contextPrefix + "ShiftSync is an intelligent pharmacy workforce scheduling system. It helps managers create weekly shifts, assign staff fairly, review adjustments and swaps, track compliance, monitor reports, and keep employees informed through dashboards, notifications, and email reminders.",
                "What ShiftSync is",
                "/",
                true
            );
        }

        if (containsAny(normalized, "login", "log in", "sign in")) {
            return new ChatResponse(
                contextPrefix + "Users sign in with email and password. After login, ShiftSync redirects them automatically based on role: manager, employee, or admin. If a manager created the account with a temporary password, the user must change it on first login.",
                "How login works",
                "/login",
                true
            );
        }

        if (containsAny(normalized, "forgot password", "reset password", "i forgot my password")) {
            return new ChatResponse(
                contextPrefix + "Use the Forgot Password link on the login page. ShiftSync emails reset instructions and a temporary password, then asks the user to change it after the next successful login.",
                "Forgot password",
                "/login",
                true
            );
        }

        if (containsAny(normalized, "auto schedule", "weekly shift", "assign shift", "schedule")) {
            return new ChatResponse(
                contextPrefix + "Managers work with a weekly rota. They can reset the visible week, run Auto Schedule to fill open roles, and then manually assign, reassign, or remove employees from the grid. The schedule should maintain the required pharmacy role coverage for each shift.",
                "Weekly shift scheduling",
                "/scheduling",
                true
            );
        }

        if (containsAny(normalized, "swap", "peer response", "adjustment", "time off")) {
            return new ChatResponse(
                contextPrefix + "Shift swaps are two-step: the peer employee responds first, then the manager makes the final approval decision. Time-off and other adjustment requests are also reviewed by the manager from the Shift Adjustments page.",
                "Shift adjustments",
                "/adjustments",
                true
            );
        }

        if (containsAny(normalized, "pay", "payroll", "salary", "earnings", "rwf")) {
            return new ChatResponse(
                contextPrefix + "Payroll in ShiftSync is monthly and shown in RWF. Employees can review current month earnings, year-to-date totals, and recent payroll records from the Earnings & Pay page.",
                "Monthly payroll",
                "/employee-earnings",
                true
            );
        }

        if (containsAny(normalized, "notification", "message", "alert", "email reminder")) {
            return new ChatResponse(
                contextPrefix + "ShiftSync supports in-app notifications, unread counts, detail views, route-aware messages, weekly assignment emails, and upcoming shift reminder emails.",
                "Notifications and alerts",
                "/notifications",
                true
            );
        }

        if (containsAny(normalized, "report", "analytics", "compliance")) {
            return new ChatResponse(
                contextPrefix + "Managers can use Reports & Analytics to review staffing coverage, team mix, and recent shift compliance records based on live assignment data.",
                "Reports and analytics",
                "/reports",
                true
            );
        }

        if (containsAny(normalized, "employee", "dashboard", "profile")) {
            return new ChatResponse(
                contextPrefix + "Employees can check their schedule, profile, announcements, notifications, and monthly payroll information. Newly created employees sign in with a temporary password first and then change it on first login.",
                "Employee workflows",
                "/employee-dashboard",
                true
            );
        }

        return new ChatResponse(
            contextPrefix + "I can help with scheduling, login, payroll, notifications, swap approvals, reports, compliance, or employee workflows. If you want, ask me a direct question like 'How does auto schedule work?'",
            topic,
            route,
            true
        );
    }

    private String buildSystemPrompt(ChatRequest request, User user) {
        String role = request.role() == null || request.role().isBlank() ? "guest" : request.role();
        String displayName = request.fullName() == null || request.fullName().isBlank()
            ? (user != null ? user.getFullName() : "user")
            : request.fullName();
        String branchName = user != null && user.getBranch() != null ? user.getBranch().getName() : "the pharmacy";
        String page = request.pathname() == null || request.pathname().isBlank() ? "/" : request.pathname();

        return """
            You are ShiftSync Assistant, the in-app AI helper for the ShiftSync pharmacy workforce scheduling system.

            Your job:
            - Answer naturally, like a real chatbot having a conversation with a person.
            - Be concise, clear, and helpful.
            - Use the conversation history to answer follow-up questions.
            - When the user is vague, ask one short clarifying question instead of guessing.
            - When useful, mention the page or feature the user should open next.
            - You may also handle general conversation, everyday questions, and light non-system topics.
            - When the topic is about ShiftSync, give product-specific answers grounded in the actual system behavior.
            - Do not invent features that are not in ShiftSync.
            - If the user asks for something unrelated to ShiftSync, answer it like a normal helpful assistant without forcing the conversation back to the system.

            About ShiftSync:
            - ShiftSync is an intelligent employee shift scheduling system for pharmacy workforce management.
            - Managers create weekly shifts, assign employees, review time-off and swap requests, monitor compliance, and review reports.
            - Employees use dashboards for schedule, announcements, payroll, profile, notifications, and settings.
            - Login uses email and password.
            - A newly created employee gets a temporary password and must change it on first login.
            - Forgot Password emails reset instructions.
            - Payroll is monthly and displayed in RWF.
            - Notifications include in-app alerts, weekly shift assignment emails, and upcoming shift reminder emails.

            Scheduling rules:
            - Weekly scheduling is the main manager workflow.
            - Managers can reset the visible week, auto schedule, and then make manual changes.
            - Shift swaps require peer response first, then manager approval as the final authority.
            - Manager scheduling changes should appear on employee schedule pages after refresh.
            - Each day should maintain the required pharmacy role coverage.

            Current chat context:
            - Current user: %s
            - Current role: %s
            - Current page: %s
            - Current pharmacy context: %s

            Response style:
            - Speak directly to the user.
            - Use short paragraphs.
            - If the answer points to a page, mention it naturally.
            - If the user asks about something not yet available, say so honestly and offer the closest supported path.
            - If the user is just chatting, respond conversationally instead of sounding like documentation.
            """.formatted(displayName, role, page, branchName);
    }

    private List<ChatMessage> trimmedHistory(List<ChatMessage> messages) {
        int start = Math.max(0, messages.size() - 10);
        return messages.subList(start, messages.size());
    }

    private String latestUserMessage(List<ChatMessage> messages) {
        for (int index = messages.size() - 1; index >= 0; index--) {
            ChatMessage message = messages.get(index);
            if ("user".equalsIgnoreCase(message.role())) {
                return message.content();
            }
        }
        return null;
    }

    private String normalizeRole(String role) {
        String normalized = role == null ? "" : role.trim().toLowerCase(Locale.ENGLISH);
        return switch (normalized) {
            case "assistant", "system" -> normalized;
            default -> "user";
        };
    }

    private String inferRoute(String query) {
        String normalized = normalize(query);
        if (containsAny(normalized, "login", "log in", "sign in", "password")) {
            return "/login";
        }
        if (containsAny(normalized, "schedule", "auto schedule", "assign shift")) {
            return "/scheduling";
        }
        if (containsAny(normalized, "swap", "adjustment", "time off")) {
            return "/adjustments";
        }
        if (containsAny(normalized, "notification", "message", "alert")) {
            return "/notifications";
        }
        if (containsAny(normalized, "pay", "payroll", "salary", "earnings")) {
            return "/employee-earnings";
        }
        if (containsAny(normalized, "report", "analytics", "compliance")) {
            return "/reports";
        }
        if (containsAny(normalized, "employee", "profile")) {
            return "/employee-dashboard";
        }
        return null;
    }

    private String inferTopic(String query) {
        String normalized = normalize(query);
        if (containsAny(normalized, "login", "log in", "sign in", "password")) {
            return "Login help";
        }
        if (containsAny(normalized, "schedule", "shift", "rota")) {
            return "Scheduling";
        }
        if (containsAny(normalized, "swap", "adjustment", "time off")) {
            return "Shift adjustments";
        }
        if (containsAny(normalized, "notification", "message", "alert")) {
            return "Notifications";
        }
        if (containsAny(normalized, "pay", "payroll", "salary", "earnings")) {
            return "Payroll";
        }
        if (containsAny(normalized, "report", "analytics", "compliance")) {
            return "Reports";
        }
        return "ShiftSync help";
    }

    private String conversationalPrefix(User user, String role, String pathname) {
        String lowerRole = role == null ? "" : role.toLowerCase(Locale.ENGLISH);
        if (pathname != null && pathname.contains("/login")) {
            return "Here is how it works: ";
        }
        if (user != null) {
            return "Sure, " + firstName(user.getFullName()) + ". ";
        }
        if (lowerRole.contains("manager") || lowerRole.contains("employee")) {
            return "Sure. ";
        }
        return "";
    }

    private String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "there";
        }
        String[] parts = fullName.trim().split("\\s+");
        return parts.length == 0 ? "there" : parts[0];
    }

    private String normalize(String value) {
        return value == null
            ? ""
            : value.toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean containsAny(String haystack, String... needles) {
        for (String needle : needles) {
            if (haystack.contains(normalize(needle))) {
                return true;
            }
        }
        return false;
    }

    private record RuntimeAiConfig(String baseUrl, String model) {}
}
