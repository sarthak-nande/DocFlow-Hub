package com.docflowhub.docflow_hub.service;

import com.docflowhub.docflow_hub.dto.OrganizationUserDto;
import com.docflowhub.docflow_hub.dto.UserDetailsResponseDto;

public interface AdminService {
	public UserDetailsResponseDto RegisterUser(OrganizationUserDto organizationUserDto);
}
