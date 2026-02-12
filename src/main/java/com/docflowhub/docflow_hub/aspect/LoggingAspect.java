package com.docflowhub.docflow_hub.aspect;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class LoggingAspect {

	private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);
	
	@Before("execution(* com.docflowhub.docflow_hub.controller.DocController.getStatusOfDocumentService())")
	public void loggBeforeMethod() {
		logger.info("Document Service API Working Okay!");
	}
}
