package com.docflowhub.docflow_hub.controller;

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
import com.docflowhub.docflow_hub.service.CustomeUserDetailsService;
import com.docflowhub.docflow_hub.utils.JwtAuthLoginUtil;

@RestController
@RequestMapping("/auth")
public class AuthController {
	
	private final JwtAuthLoginUtil jwtAuthLoginUtil;
	private final AuthenticationManager authenticationManager;
	
	@Autowired
	public AuthController(JwtAuthLoginUtil jwtAuthLoginUtil, AuthenticationManager authenticationManager) {
		this.jwtAuthLoginUtil = jwtAuthLoginUtil;
		this.authenticationManager = authenticationManager;
	}

	@PostMapping("/login")
	public ResponseEntity<ResponseAuthDto> userLoginAuthentication(@RequestBody RequestAuthDto requestLoginDetails){
		Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(requestLoginDetails.username(), requestLoginDetails.password()));
		
		String token = jwtAuthLoginUtil.generateJwtToken(authentication.getName());
		
		ResponseAuthDto responseAuthDto = new ResponseAuthDto(token, authentication.getName());
		
		return ResponseEntity.ok(responseAuthDto);
	}
}
