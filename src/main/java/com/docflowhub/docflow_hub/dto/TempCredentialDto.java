package com.docflowhub.docflow_hub.dto;

import jakarta.validation.constraints.NotBlank;

public record TempCredentialDto(
		@NotBlank(message = "Username Required")
		String Username,
		@NotBlank(message = "Password Required")
		String Password
) {}
