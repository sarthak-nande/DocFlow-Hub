package com.docflowhub.docflow_hub.dto;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

public record ErrorResponseDto<T>(
		String path,
	    HttpStatus status,
	    String message,
	    LocalDateTime timestamp
	) {}
