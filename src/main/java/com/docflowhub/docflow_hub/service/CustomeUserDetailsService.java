package com.docflowhub.docflow_hub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.repository.UserRepository;

@Service
public class CustomeUserDetailsService implements UserDetailsService{
	
	private final UserRepository userRepository;
	
	@Autowired
	public CustomeUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Users myUser = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));
		
		
		return User.builder()
				.username(myUser.getEmail())
				.password(myUser.getPassword())
				.authorities(myUser.getRole())
				.build();
	}

}
