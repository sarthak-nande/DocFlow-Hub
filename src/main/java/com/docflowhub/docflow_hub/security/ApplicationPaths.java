package com.docflowhub.docflow_hub.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationPaths {
	
	@Bean(name="publicPath")
	public List<String> publicPath() {
		return List.of("/api/v*/auth/login","/api/v*/auth/sign-up","/api/v*/csrf-token/public");
	}
	
	@Bean(name="privatePath")
	public List<String> privatePath() {
		return List.of("/api/documents/status");
	}

}
