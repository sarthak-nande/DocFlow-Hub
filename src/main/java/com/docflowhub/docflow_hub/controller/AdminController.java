package com.docflowhub.docflow_hub.controller;

import java.net.http.HttpRequest;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docflowhub.docflow_hub.dto.SuccessResponseDto;
import com.docflowhub.docflow_hub.dto.UserDto;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.service.AdminService;
import com.docflowhub.docflow_hub.versioning.ApiVersion;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@ApiVersion(1)
@RequestMapping("/admin")
public class AdminController {
	
	private final AdminService adminService;
	
	@Autowired
	public AdminController(AdminService adminService) {
		this.adminService = adminService;
	}

	@GetMapping("/register-user")
	public ResponseEntity<SuccessResponseDto<String>> RegisterUsers(@RequestBody UserDto userDto,HttpServletRequest request){
		Users user = adminService.RegisterUser(userDto);
		
		SuccessResponseDto<String> response = new SuccessResponseDto<>(
				request.getRequestURI(),
		        HttpStatus.OK,
		        "User registerd successfully",
		        user,
		        LocalDateTime.now()
		);
		
		return ResponseEntity.ok(response);
	}
}
