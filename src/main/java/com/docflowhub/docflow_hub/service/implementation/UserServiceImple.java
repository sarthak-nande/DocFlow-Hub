package com.docflowhub.docflow_hub.service.implementation;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docflowhub.docflow_hub.dto.CreatePassword;
import com.docflowhub.docflow_hub.dto.TempCredentialDto;
import com.docflowhub.docflow_hub.dto.UserDetailsResponseDto;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Role;
import com.docflowhub.docflow_hub.entity.TempCred;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.exception.UserAlreadyExistsException;
import com.docflowhub.docflow_hub.repository.TempCredRepository;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.EmailService;
import com.docflowhub.docflow_hub.service.UserService;
import com.docflowhub.docflow_hub.utils.AccountActivationEmailUtils;

@Service
public class UserServiceImple implements UserService {

	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AccountActivationEmailUtils accountActivationEmailUtils;
	private final EmailService emailService;
	private final TempCredRepository tempCredRepository;

	@Autowired
	public UserServiceImple(UserRepository userRepository, PasswordEncoder passwordEncoder, AccountActivationEmailUtils accountActivationEmailUtils, EmailService emailService, TempCredRepository tempCredRepository) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.accountActivationEmailUtils = accountActivationEmailUtils;
		this.emailService =  emailService;
		this.tempCredRepository = tempCredRepository;
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
		users.setActive(false);		
		userRepository.save(users);
		
		UserDetailsResponseDto userDetailsResponseDto = new UserDetailsResponseDto(users.getName(), users.getEmail(), users.getRole(), users.getOrganizationId(), users.isActive(), users.getExtraDetials());
		
		String token = accountActivationEmailUtils.generateActivationToken(users.getEmail());
		
		String html = accountActivationEmailUtils.buildActivationEmail(users.getEmail(), token);
		
		emailService.sendHtmlEmail(users.getEmail(), "Activate Your Account", html);
		
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

	@Override
	public String activateUserAccount(String token) {
		return accountActivationEmailUtils.VerifyActivationToken(token);
	}

	@Override
	public String setNewPassword(CreatePassword createPassword) {
		Users user = userRepository.findByEmail(createPassword.username()).orElseThrow(() -> new UsernameNotFoundException("User Not Found"));
		
		String password = createPassword.password();
		
		String encryptedPassword = passwordEncoder.encode(password);
		
		user.setPassword(encryptedPassword);
		
		userRepository.save(user);
		
		return "User Password Reset Successfuly";
	}

	@Override
	public boolean validTempUser(TempCredentialDto tempCredentialDto) {
		TempCred tempCred = tempCredRepository.findByEmail(tempCredentialDto.Username()).orElseThrow(() -> new UsernameNotFoundException("Invalid Tempraroy Credentails"));
		if(passwordEncoder.matches(tempCredentialDto.Password(),tempCred.getPassword())) {
			return true;
		}
		return false;
	}

}
