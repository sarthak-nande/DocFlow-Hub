package com.docflowhub.docflow_hub.utils;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.docflowhub.docflow_hub.repository.UserRepository;

@Component
public class GenerateOrganizationId {
	
	private final UserRepository userRepository;
	private final SecureRandom secureRandom;
	
	@Autowired
	public GenerateOrganizationId(UserRepository userRepository, SecureRandom secureRandom) {
		this.userRepository = userRepository;
		this.secureRandom = secureRandom;
	}
	
	public String generate(String organizationName) {
		String extarctedLetters = extract(organizationName);
		String organizationId;

        do {
            
            int randomDigits = secureRandom.nextInt(1000000);
            organizationId = extarctedLetters + String.format("%06d", randomDigits);
            
        } while (userRepository.existsByOrganizationId(organizationId));

        return organizationId;
	}
	
	public static String extract(String name) {
		if (name == null || name.trim().isEmpty()) {
            return "ORG"; 
        }

        String cleanName = name.replaceAll("[^a-zA-Z]", "").toUpperCase();

        if (cleanName.length() >= 3) {
            return cleanName.substring(0, 3);
        } else {
            
            return String.format("%-3s", cleanName).replace(' ', 'X');
        }
	}

}
