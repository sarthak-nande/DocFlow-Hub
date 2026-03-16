package com.docflowhub.docflow_hub.service.implementation;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.exception.UserAlreadyExistsException;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.UserService;

@Service
public class UserServiceImple implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserServiceImple(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public Users registerUser(UserDto userDto) {
		
		if (userRepository.existsByEmail(userDto.email())) {
			throw new UserAlreadyExistsException("User Already Exist With This Username");
		}
		Users users = new Users(userDto);
		
		String encodedPassword = passwordEncoder.encode(userDto.password());
		
		users.setPassword(encodedPassword);
		
		return userRepository.save(users);

	}

}
