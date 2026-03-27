package com.docflowhub.docflow_hub.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docflowhub.docflow_hub.versioning.ApiVersion;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/csrf-token")
@ApiVersion(1)
public class CsrfController {
	
	@GetMapping("/public")
	public CsrfToken csrfToken(HttpServletRequest httpServletRequest) {
		return (CsrfToken)httpServletRequest.getAttribute(CsrfToken.class.getName());
	}

}
