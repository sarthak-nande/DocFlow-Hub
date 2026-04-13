package com.docflowhub.docflow_hub.dto;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;

public record CreatePassword(
		
		@NotBlank(message = "Please Enter Username")
		String username,
		
		@NotBlank(message = "Please Enter Password")
		String password,
		
		@NotBlank(message = "Please Enter RepeatePassowrd")
		String repeatePassword) implements Serializable{
	
}
