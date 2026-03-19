package com.docflowhub.docflow_hub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    @GetMapping("/status")
    public ResponseEntity<String> getStatusOfDocumentService() {
    	
    	return ResponseEntity.ok("API Working Okay");
    }
}
