package com.docflowhub.docflow_hub.entity;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.docflowhub.docflow_hub.dto.UserDto;

@Document(collection = "users")
public class Users extends BaseEntity{

	@Id
	private String id;
	
	private String name;
	
	private String email;
	
	private String password;
	
	private Role role;
	
	private String organizationId;
	
	private boolean active;
	
	private Map<String, Object> extraDetials;
	
	public Users() {
		
	}

	public Users(String name, String email, String password, Role role, String organizationId, boolean active,
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

	public Users(UserDto userDto) {
		this.name = userDto.name();
		this.email = userDto.email();
		this.password = userDto.password();
		this.role = userDto.role();
		this.organizationId = userDto.organizationId();
		this.active = userDto.active();
		this.extraDetials = userDto.extraDetails();
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
		return role.name();
	}

	public void setRole(Role role) {
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

	public String getOrganizationId() {
		return organizationId;
	}

	public void setOrganizationId(String organizationId) {
		this.organizationId = organizationId;
	}
	
	
	
}
