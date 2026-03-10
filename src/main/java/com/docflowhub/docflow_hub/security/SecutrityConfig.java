package com.docflowhub.docflow_hub.security;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class SecutrityConfig {

	final private List<String> publicPath;
	final private List<String> privatePath;

	public SecutrityConfig(@Qualifier("publicPath") List<String> publicPath,
			@Qualifier("privatePath") List<String> privatePath) {
		this.publicPath = publicPath;
		this.privatePath = privatePath;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
		return httpSecurity.csrf(csrfc -> csrfc.disable()).authorizeHttpRequests(request -> {
			publicPath.forEach(path -> request.requestMatchers(path).permitAll());
			privatePath.forEach(path -> request.requestMatchers(path).authenticated());
		}).formLogin(flc -> flc.disable()).httpBasic(hbc -> hbc.disable()).build();
	}

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration config = new CorsConfiguration();

		config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
		config.setAllowedMethods(Collections.singletonList("*"));
		config.setAllowedHeaders(Arrays.asList("Content-Type"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return new CorsFilter(source);
	}

}
