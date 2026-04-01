package com.docflowhub.docflow_hub.utils;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.docflowhub.docflow_hub.entity.ActivationLink;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.repository.AccountActivationLinkRepository;
import com.docflowhub.docflow_hub.repository.UserRepository;

@Component
public class AccountActivationEmailUtils {
	
	@Autowired
    private SpringTemplateEngine templateEngine;
	
	@Autowired
	private AccountActivationLinkRepository accountActivationLinkRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public String generateActivationToken(String email) {	
		String token = UUID.randomUUID().toString();
		
		ActivationLink activationLink = new ActivationLink();

		activationLink.setToken(token);
		activationLink.setExpirationTime(LocalDateTime.now().plusMinutes(30));
		activationLink.setEmail(email);
		
		accountActivationLinkRepository.save(activationLink);
		
		return activationLink.getToken();
	}
	
	public String buildActivationEmail(String name, String token) {
	    Context context = new Context();
	    String link = "http://localhost:8080/api/v1/user/activate/account?token=" + token;
	    context.setVariable("name", name);
	    context.setVariable("activationLink", link);

	    return templateEngine.process("activation", context);
	}
	
	
	public String VerifyActivationToken(String token) {
		ActivationLink activationLink = accountActivationLinkRepository.findByToken(token).orElseThrow(() -> new RuntimeException("Invalid token"));
		
		if (activationLink.getExpirationTime().isBefore(LocalDateTime.now())) {
	        throw new RuntimeException("Token expired");
	    }
		String origanalToken = activationLink.getToken();
		
		Users users = userRepository.findByEmail(activationLink.getEmail()).orElseThrow(() -> new RuntimeException("Invalid Email"));
		
		users.setActive(true);
		
		return "Your Account Successfuly Activated Please Go To Login Page";
	}
	

}
