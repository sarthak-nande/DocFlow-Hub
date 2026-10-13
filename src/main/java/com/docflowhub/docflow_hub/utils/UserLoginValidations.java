package com.docflowhub.docflow_hub.utils;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.docflowhub.docflow_hub.entity.ActivationLink;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.repository.AccountActivationLinkRepository;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.implementation.EmailServiceImplements;

@Component
public class UserLoginValidations {
	
	private final UserRepository userRepository;
	private final AccountActivationLinkRepository accountActivationLinkRepository;
	private final AccountActivationEmailUtils accountActivationEmailUtils;
	private final EmailServiceImplements emailService;
	
	@Autowired
	public UserLoginValidations(UserRepository userRepository, AccountActivationLinkRepository accountActivationLinkRepository, AccountActivationEmailUtils accountActivationEmailUtils, EmailServiceImplements emailService) {
		this.userRepository = userRepository;
		this.accountActivationLinkRepository = accountActivationLinkRepository;
		this.accountActivationEmailUtils = accountActivationEmailUtils;
		this.emailService = emailService;
	}
	
	public boolean validateStatus(String username){
		Users user = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException(username));
		
		if(!user.isActive()) {
			ActivationLink activationLink = accountActivationLinkRepository.findByEmail(username);
			if (activationLink.getExpirationTime().isBefore(LocalDateTime.now())) {
				accountActivationLinkRepository.delete(activationLink);
		        String token = accountActivationEmailUtils.generateActivationToken(username);
		        String html = accountActivationEmailUtils.buildActivationEmail(username, token);
		        emailService.sendHtmlEmail(username, "Activate Your Account", html);
		    }
			return false;
		}
		
		return user.isActive();
	}

}
