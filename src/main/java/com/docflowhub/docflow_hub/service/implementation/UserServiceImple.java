package com.docflowhub.docflow_hub.service.implementation;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docflowhub.docflow_hub.dto.UserDetailsResponseDto;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Role;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.exception.UserAlreadyExistsException;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.UserService;

@Service
public class UserServiceImple implements UserService {

	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Autowired
	public UserServiceImple(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public UserDetailsResponseDto registerUser(UserDto userDto) {
		
		if (userRepository.existsByEmail(userDto.email())) {
			throw new UserAlreadyExistsException("User Already Exist With This Username");
		}
		Users users = new Users(userDto);
		
		String encodedPassword = passwordEncoder.encode(userDto.password());
		
		users.setPassword(encodedPassword);
		Role userRole = Role.valueOf("ROLE_ADMIN");
		users.setRole(userRole); 
		
		userRepository.save(users);
		
		UserDetailsResponseDto userDetailsResponseDto = new UserDetailsResponseDto(users.getName(), users.getEmail(), users.getRole(), users.getOrganizationId(), users.isActive(), users.getExtraDetials());
		
		return userDetailsResponseDto;

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
		parsedUser.setActive(userDto.active());
		
		return userRepository.save(parsedUser);
	}

}
