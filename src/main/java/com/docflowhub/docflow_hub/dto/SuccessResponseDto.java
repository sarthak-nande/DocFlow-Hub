package com.docflowhub.docflow_hub.dto;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

public record SuccessResponseDto<T>(
	    String path,
	    HttpStatus status,
	    String message,
	    Object object,
	    LocalDateTime timestamp
	) {}