package com.docflowhub.docflow_hub.entity;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class Users extends BaseEntity{

	@Id
	private String id;
	
	private String name;
	
	private String email;
	
	private String password;
	
	private String role;
	
	private String organizationId;
	
	private boolean active;
	
	private Map<String, Object> extraDetials;

	public Users(String name, String email, String password, String role, String organizationId, boolean active,
			Map<String, Object> extraDetials) {
		super();
		this.name = name;
		this.email = email;
		this.password = password;
		this.role = role;
		this.organizationId = organizationId;
		this.active = active;
		this.extraDetials = extraDetials;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public Map<String, Object> getExtraDetials() {
		return extraDetials;
	}

	public void setExtraDetials(Map<String, Object> extraDetials) {
		this.extraDetials = extraDetials;
	}
	
}
