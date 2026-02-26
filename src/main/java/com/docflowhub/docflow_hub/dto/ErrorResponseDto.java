package com.docflowhub.docflow_hub.dto;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

public record ErrorResponseDto(String apiPath, HttpStatus errorCode, String errorMessage, LocalDateTime errorTime) {

}
