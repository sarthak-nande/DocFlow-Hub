package com.docflowhub.docflow_hub.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.docflowhub.docflow_hub.dto.CreatePassword;
import com.docflowhub.docflow_hub.dto.SuccessResponseDto;
import com.docflowhub.docflow_hub.dto.TempCredentialDto;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.service.UserService;
import com.docflowhub.docflow_hub.versioning.ApiVersion;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@ApiVersion(1)
@RequestMapping("/user")
public class UserController {

	private final UserService userService;
	
	@Autowired
	public UserController(UserService userService) {
		this.userService = userService;
	}
	
	@PostMapping("/userDetails")
	public ResponseEntity<SuccessResponseDto<Users>> getUserDetails(@RequestBody Map<String, String> payload, HttpServletRequest request){
		String email = payload.get("email");
		Users user = userService.getUser(email).orElseThrow(() -> new UsernameNotFoundException("User Not Found"));
		
		SuccessResponseDto<Users> response = new SuccessResponseDto<>(
				request.getRequestURI(),
		        HttpStatus.OK,
		        "User registerd successfully",
		        user,
		        LocalDateTime.now()
		);
		
		return ResponseEntity.ok().body(response);
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
	
	@GetMapping("/create/password")
	public boolean checkValidTempUser(@RequestParam String email, @RequestParam String password) {
		TempCredentialDto tempCredentialDto = new TempCredentialDto(email, password);
		return userService.validTempUser(tempCredentialDto);
	}
	
	@PostMapping("/create/password")
	public String createNewPassword(@RequestBody CreatePassword createPassword) {
		return userService.setNewPassword(createPassword);
	}
}
