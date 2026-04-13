package com.docflowhub.docflow_hub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.docflowhub.docflow_hub.dto.CreatePassword;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.service.UserService;
import com.docflowhub.docflow_hub.versioning.ApiVersion;

@RestController
@ApiVersion(1)
@RequestMapping("/user")
public class UserController {

	private final UserService userService;
	
	@Autowired
	public UserController(UserService userService) {
		this.userService = userService;
	}
	
	@GetMapping("/userDetails")
	public ResponseEntity<Users> getUserDetails(@RequestBody String email){
		Users user = userService.getUser(email).get();
		
		return ResponseEntity.status(200).body(user);
	}
	
	@PostMapping("/edit")
	public ResponseEntity<Users> updateUserDetails(@RequestBody UserDto userDto){
		Users user = userService.updateUserDetials(userDto);
		
		return ResponseEntity.status(200).body(user);
	}
	
	@GetMapping("/activate/account")
	public String activateAccount(@RequestParam String token) {
		return userService.activateUserAccount(token);
	}
	
	@PostMapping("/create/password")
	public String createNewPassword(@RequestParam CreatePassword createPassword) {
		
	}
}
