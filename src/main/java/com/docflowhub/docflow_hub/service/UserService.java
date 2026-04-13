package com.docflowhub.docflow_hub.service;

import java.util.Optional;

import com.docflowhub.docflow_hub.dto.CreatePassword;
import com.docflowhub.docflow_hub.dto.UserDetailsResponseDto;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;

public interface UserService {
	public UserDetailsResponseDto registerUser(UserDto userDto);
	
	public Optional<Users> getUser(String Username);
	
	public Users updateUserDetials(UserDto userDto);
	
	public String activateUserAccount(String token);
	
	public String setNewPassword(CreatePassword createPassword);
	
}
