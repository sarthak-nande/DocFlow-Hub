package com.docflowhub.docflow_hub.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "activationlink")
public class ActivationLink {

	@Id
	private String id;
	
	private String email;
	
	private String token;
	
	private LocalDateTime expirationTime;
	
	public ActivationLink() {
		
	}
	
	public ActivationLink(String email, String token, LocalDateTime expirationTime) {
		super();
		this.email = email;
		this.token = token;
		this.expirationTime = expirationTime;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public LocalDateTime getExpirationTime() {
		return expirationTime;
	}

	public void setExpirationTime(LocalDateTime localDateTime) {
		this.expirationTime = localDateTime;
	}
	
	
}
