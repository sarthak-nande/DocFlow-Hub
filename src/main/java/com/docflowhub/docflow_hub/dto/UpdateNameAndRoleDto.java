package com.docflowhub.docflow_hub.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateNameAndRoleDto(
		@NotBlank(message = "username should not be blank")
		String username,
		@NotBlank(message = "role should not be blank")
		String role,
		@NotBlank(message = "name should not be blank")
		String name
		) {

}
