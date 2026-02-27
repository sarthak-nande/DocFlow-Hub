package com.docflowhub.docflow_hub.audit;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class Auditing {
	
	@Bean
	public AuditorAware<String> auditorProvider() {
	    return () -> Optional.of("SYSTEM");
	}
}
