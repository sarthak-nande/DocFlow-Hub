package com.docflowhub.docflow_hub.service.implementation;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
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

	@Override
	public Optional<Users> getUser(String Username) {
		Optional<Users> user = userRepository.findByEmail(Username);
		return user;
	}

	@Override
	public Users updateUserDetials(UserDto userDto) {
		Optional<Users> user = userRepository.findByEmail(userDto.email());
		
		Users parsedUser = user.get();
		
		parsedUser.setName(userDto.name());
		parsedUser.setRole(userDto.role());
		parsedUser.setActive(userDto.active());
		
		return userRepository.save(parsedUser);
	}

}
