package com.docflowhub.docflow_hub.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateStatusDto(
		@NotBlank(message="Username Required")
		String username,
		@NotBlank(message="User Status required")
		boolean status
		) {

}
