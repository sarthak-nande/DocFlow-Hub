package com.docflowhub.docflow_hub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.docflowhub.docflow_hub.dto.TempCredentialDto;

@Document(collection = "tempcred")
public class TempCred {

	@Id
	private String id;
	
	private String email;
	
	private String password;
	
	public TempCred() {
		
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

	public TempCred(String email, String password) {
		super();
		this.email = email;
		this.password = password;
	}
	
	public TempCred(TempCredentialDto tempCredentialDto) {
		this.email = tempCredentialDto.Username();
		this.password = tempCredentialDto.Password();
	}
}
