package com.docflowhub.docflow_hub.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.docflowhub.docflow_hub.service.CustomeUserDetailsService;
import com.docflowhub.docflow_hub.utils.JwtAuthLoginUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter{
	
	private final CustomeUserDetailsService customeUserDetailsService;
	private final JwtAuthLoginUtil jwtAuthLoginUtil;
	
	@Autowired
	public JwtAuthenticationFilter(CustomeUserDetailsService customeUserDetailsService, JwtAuthLoginUtil jwtAuthLoginUtil) {
		this.customeUserDetailsService = customeUserDetailsService;
		this.jwtAuthLoginUtil = jwtAuthLoginUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		
		String requestHeader = request.getHeader("Authorization");
		
		if(requestHeader != null && requestHeader.startsWith("Bearer ")) {
			String token = requestHeader.substring(7);
			
			if(jwtAuthLoginUtil.verifyToken(token)) {
				String username = jwtAuthLoginUtil.getUsernameByToken(token);
				UserDetails userDetails = customeUserDetailsService.loadUserByUsername(username);
				
				UsernamePasswordAuthenticationToken authtoken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
				
				authtoken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				SecurityContextHolder.getContext().setAuthentication(authtoken);
			}
		}
		filterChain.doFilter(request, response);
	}

}
