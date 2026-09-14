package com.docflowhub.docflow_hub.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.repository.UserRepository;

@Component
public class UserLoginValidations {
	
	@Autowired
	private final UserRepository userRepository;
	
	public UserLoginValidations(UserRepository userRepository) {
		this.userRepository = userRepository;
	}
	
	public boolean validateStatus(String username){
		Users user = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException(username));
		if(!user.isActive()) {
			return false;
		}
		
		return user.isActive();
	}

}
