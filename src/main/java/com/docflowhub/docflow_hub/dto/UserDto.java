package com.docflowhub.docflow_hub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;
import java.util.Map;

import com.docflowhub.docflow_hub.entity.Role;

public record UserDto(
    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    String password,
    
    @NotBlank(message="Organization Name is required")
    String organizationName,

    boolean active,

    Map<String, Object> extraDetails 
) implements Serializable {}