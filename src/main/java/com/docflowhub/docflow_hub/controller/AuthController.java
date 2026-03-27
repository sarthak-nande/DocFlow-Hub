package com.docflowhub.docflow_hub.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docflowhub.docflow_hub.dto.RequestAuthDto;
import com.docflowhub.docflow_hub.dto.ResponseAuthDto;
import com.docflowhub.docflow_hub.dto.UserDetailsResponseDto;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.service.UserService;
import com.docflowhub.docflow_hub.utils.JwtAuthLoginUtil;
import com.docflowhub.docflow_hub.versioning.ApiVersion;

@RestController
@ApiVersion(1)
@RequestMapping("/auth")
public class AuthController {

	private final JwtAuthLoginUtil jwtAuthLoginUtil;
	private final AuthenticationManager authenticationManager;
	private final UserService userService;

	@Autowired
	public AuthController(JwtAuthLoginUtil jwtAuthLoginUtil, AuthenticationManager authenticationManager,
			UserService userService) {
		this.jwtAuthLoginUtil = jwtAuthLoginUtil;
		this.authenticationManager = authenticationManager;
		this.userService = userService;
	}

	@PostMapping("/login")
	public ResponseEntity<ResponseAuthDto> userLoginAuthentication(@RequestBody RequestAuthDto requestLoginDetails) {
		Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
				requestLoginDetails.username(), requestLoginDetails.password()));

		String token = jwtAuthLoginUtil.generateJwtToken(authentication.getName());

		ResponseAuthDto responseAuthDto = new ResponseAuthDto(token, authentication.getName());

		return ResponseEntity.ok(responseAuthDto);
	}

	@PostMapping("/sign-up")
	public ResponseEntity<?> userRegistration(@RequestBody UserDto userDto) {
		System.out.println(userDto);
		UserDetailsResponseDto user = userService.registerUser(userDto);

		return ResponseEntity.status(201).body(Map.of("message", "User Successfully Register", "user", user));
	}
}
