package com.docflowhub.docflow_hub.utils;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.docflowhub.docflow_hub.dto.TempCredentialDto;

@Component
public class TempUsernameAndPassword {
	
	@Autowired
	private SpringTemplateEngine templateEngine;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	 private static final String CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
	    private static final SecureRandom random = new SecureRandom();

	    public static String generateTempPassword(int length) {
	        StringBuilder password = new StringBuilder();

	        for (int i = 0; i < length; i++) {
	            int index = random.nextInt(CHAR_SET.length());
	            password.append(CHAR_SET.charAt(index));
	        }

	        return password.toString();
	    }	
	
	public String generateTempraroyCredential(String username) {
		Context context = new Context();
		
		
		String tempPassword = generateTempPassword(8);
		String tempUsername = username;
		
		context.setVariable("username", tempUsername);
		context.setVariable("temporaryPassword", tempPassword);
		
		String encrpytTempPassowrd = passwordEncoder.encode(tempPassword);
		
		TempCredentialDto tempCred = new TempCredentialDto(encrpytTempPassowrd,tempUsername);
		
		return templateEngine.process("tempPasswordAndEmail", context);
	}
	
	

}
