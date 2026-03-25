package com.docflowhub.docflow_hub.service;

import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;

public interface AdminService {
	public Users RegisterUser(UserDto userDto);
}
