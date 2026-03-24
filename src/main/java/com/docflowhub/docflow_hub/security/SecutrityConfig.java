package com.docflowhub.docflow_hub.security;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import jakarta.servlet.http.HttpServletResponse;

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
	public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
		return httpSecurity
				.csrf(csrfc -> csrfc.disable())
				.authorizeHttpRequests(request -> {
			publicPath.forEach(path -> request.requestMatchers(path).permitAll());
			privatePath.forEach(path -> request.requestMatchers(path).authenticated());
			request.anyRequest().authenticated();
			
		})
				.exceptionHandling(ex -> ex.authenticationEntryPoint((req, res, e) -> {
	                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
	            }))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.formLogin(flc -> flc.disable())
				.httpBasic(hbc -> hbc.disable())
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.build();
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
	
	@Bean
	public PasswordEncoder passwordEncoder(){
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}
}
