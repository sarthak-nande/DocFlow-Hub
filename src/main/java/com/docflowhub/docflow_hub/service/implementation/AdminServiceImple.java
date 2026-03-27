package com.docflowhub.docflow_hub.service.implementation;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docflowhub.docflow_hub.dto.UserDetailsResponseDto;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.exception.UnAuthorizedAccessException;
import com.docflowhub.docflow_hub.exception.UserAlreadyExistsException;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.AdminService;

@Service
public class AdminServiceImple implements AdminService{
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	@Autowired
	public AdminServiceImple(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public UserDetailsResponseDto RegisterUser(UserDto userDto) {
		boolean isUserExist = userRepository.existsByEmail(userDto.email());
		
		if(isUserExist) {
			throw new UserAlreadyExistsException("User already register with this username!");
		}
		
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		
		String adminUsername = auth.getName();
		
		Optional<Users> adminDetials = userRepository.findByEmail(adminUsername);
		
		String orgnizationName = adminDetials.get().getOrganizationId();
		
		if(!orgnizationName.equals(userDto.organizationId())) {
			throw new UnAuthorizedAccessException("User is unauthorized to perfrom this action");
		}
		
		String encryptedPassword = passwordEncoder.encode(userDto.password());
		
		Users user = new Users(userDto);
		
		user.setPassword(encryptedPassword);
		
		userRepository.save(user);
		
		UserDetailsResponseDto userDetailsResponseDto = new UserDetailsResponseDto(user.getName(), user.getEmail(), user.getRole(), user.getOrganizationId(), user.isActive(), user.getExtraDetials());
		
		return userDetailsResponseDto;
	}


}
