package com.docflowhub.docflow_hub.dto;

import java.util.Map;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OrganizationUserDto(
		@NotBlank(message = "Name is required")
	    String name,

	    @NotBlank(message = "Email is required")
	    @Email(message = "Invalid email format")
	    String email,

	    @NotBlank(message = "Role is required")
	    String role,

	    @NotBlank(message = "Organization ID is required")
	    String organizationId,

	    boolean active,

	    Map<String, Object> extraDetails 
		) {

}
