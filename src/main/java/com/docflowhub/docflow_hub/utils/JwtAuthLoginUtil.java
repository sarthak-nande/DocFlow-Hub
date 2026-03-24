package com.docflowhub.docflow_hub.utils;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthLoginUtil {

	@Value("${JWT_SECREATE}")
	private String secret;

	private final long exiprationTime = 3600000;
	
	private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

	public String generateJwtToken(String username) {
		return Jwts.builder().subject(username).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + exiprationTime)).signWith(getSigningKey()).compact();
	}
	
	public String getUsernameByToken(String token) {
		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getSubject();
	}
	
	public boolean verifyToken(String token) {
		try {
			Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
			return true;
		} catch (UnsupportedJwtException e) {
			return false;
		} 
		
	}
	

}
