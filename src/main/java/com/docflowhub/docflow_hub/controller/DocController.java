package com.docflowhub.docflow_hub.controller;

import com.docflowhub.docflow_hub.entity.UserDocument;
import com.docflowhub.docflow_hub.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documents")
public class DocController {

    @GetMapping("/status")
    public String getStatusOfDocumentService() {
    	return "Documents Service Working Fine!";
    }
}
