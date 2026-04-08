package com.docflowhub.docflow_hub.service.implementation;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docflowhub.docflow_hub.dto.OrganizationUserDto;
import com.docflowhub.docflow_hub.dto.UserDetailsResponseDto;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.exception.UnAuthorizedAccessException;
import com.docflowhub.docflow_hub.exception.UserAlreadyExistsException;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.AdminService;
import com.docflowhub.docflow_hub.utils.TempUsernameAndPassword;

@Service
public class AdminServiceImple implements AdminService{
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailServiceImplements emailServiceImplements;
	private final TempUsernameAndPassword tempUsernameAndPassword;
	
	@Autowired
	public AdminServiceImple(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailServiceImplements emailServiceImplements, TempUsernameAndPassword tempUsernameAndPassword) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailServiceImplements = emailServiceImplements;
		this.tempUsernameAndPassword = tempUsernameAndPassword;
	}

	@Override
	public UserDetailsResponseDto RegisterUser(OrganizationUserDto organizationUserDto) {
		boolean isUserExist = userRepository.existsByEmail(organizationUserDto.email());
		
		if(isUserExist) {
			throw new UserAlreadyExistsException("User already register with this username!");
		}
		
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		
		String adminUsername = auth.getName();
		
		Optional<Users> adminDetials = userRepository.findByEmail(adminUsername);
		
		String orgnizationName = adminDetials.get().getOrganizationId();
		
		if(!orgnizationName.equals(organizationUserDto.organizationId())) {
			throw new UnAuthorizedAccessException("User is unauthorized to perfrom this action");
		}
		
		Users user = new Users(organizationUserDto);
		
		userRepository.save(user);
		
		String html = tempUsernameAndPassword.generateTempraroyCredential(user.getEmail());
		
		emailServiceImplements.sendHtmlEmail(user.getEmail(), "Welcome To " + user.getOrganizationId() + ", Your Registreation Details Here", html);
		
		UserDetailsResponseDto userDetailsResponseDto = new UserDetailsResponseDto(user.getName(), user.getEmail(), user.getRole(), user.getOrganizationId(), user.isActive(), user.getExtraDetials());
		
		return userDetailsResponseDto;
	}


}
