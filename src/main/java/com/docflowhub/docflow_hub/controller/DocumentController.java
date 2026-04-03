package com.docflowhub.docflow_hub.controller;


import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.docflowhub.docflow_hub.dto.FileUploadResponseDto;
import com.docflowhub.docflow_hub.service.DocumentStorageService;
import com.docflowhub.docflow_hub.versioning.ApiVersion;

@RestController
@ApiVersion(1)
@RequestMapping("/documents")
public class DocumentController {
	
	private final DocumentStorageService documentStorageService;
	
	private static final List<String> ALLOWD_FILES_TYPES = Arrays.asList(
			"application/pdf",
            "image/jpeg",
            "image/png",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	);
	
	public DocumentController(DocumentStorageService documentStorageService) {
		this.documentStorageService = documentStorageService;
	}

    @GetMapping("/status")
    public ResponseEntity<String> getStatusOfDocumentService() {   	
    	return ResponseEntity.ok("API Working Okay");
    }
    
    @PostMapping(value = "/upload" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponseDto> uploadFile(@RequestParam("file") MultipartFile file){
    	
    	if(file.isEmpty()) {
    		return ResponseEntity.badRequest().body(
    				new FileUploadResponseDto(null,null,0, null, "Error: File Is Empty"));
    	}
    	
    	String contentType = file.getContentType();
    	
    	if(contentType == null && !ALLOWD_FILES_TYPES.contains(contentType)) {
    		return ResponseEntity.badRequest().body(
    				new FileUploadResponseDto(null, null, 0, null, "Error: File Type Is Invalid"));
    	}
    	
    	try {
			String storagePath = documentStorageService.uploadFile(file);
			
			return ResponseEntity.status(HttpStatus.CREATED).body(
					new FileUploadResponseDto(file.getOriginalFilename(),contentType,file.getSize(),storagePath, "File Stored Successfuly"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(
    				new FileUploadResponseDto(null, null, 0, null, "Error: Falied To Store File"));
		}
    }
    
 
}
