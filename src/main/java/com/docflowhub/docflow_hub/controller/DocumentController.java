package com.docflowhub.docflow_hub.controller;


import java.time.LocalDateTime;
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

import com.docflowhub.docflow_hub.dto.ErrorResponseDto;
import com.docflowhub.docflow_hub.dto.FileUploadResponseDto;
import com.docflowhub.docflow_hub.dto.SuccessResponseDto;
import com.docflowhub.docflow_hub.entity.Documents;
import com.docflowhub.docflow_hub.service.DocumentStorageService;
import com.docflowhub.docflow_hub.versioning.ApiVersion;

import jakarta.servlet.http.HttpServletRequest;

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
    
    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<FileUploadResponseDto>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folderId", required = false) String folderId) {

        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body(
                    List.of(new FileUploadResponseDto(null, null, 0, null, "Error: No files selected"))
            );
        }

        // Validate MIME types
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType == null || !ALLOWD_FILES_TYPES.contains(contentType)) {
                    return ResponseEntity.badRequest().body(
                            List.of(new FileUploadResponseDto(
                                    file.getOriginalFilename(),
                                    contentType,
                                    file.getSize(),
                                    null,
                                    "Error: File type not permitted"
                            ))
                    );
                }
            }
        }

        List<FileUploadResponseDto> responseList = documentStorageService.uploadFiles(files, folderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseList);
    }    
    
    @GetMapping("/folder")
    public ResponseEntity<?> getDocumentsByFolder(
            @RequestParam(value = "folderId", required = false) String folderId, 
            HttpServletRequest request) {
        
        try {
            List<Documents> documents = documentStorageService.getDocumentsByFolder(folderId);

            SuccessResponseDto<List<Documents>> response = new SuccessResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.OK,
                    "Documents retrieved successfully",
                    documents,
                    LocalDateTime.now()
            );

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            ErrorResponseDto<String> errorResponse = new ErrorResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.BAD_REQUEST,
                    e.getMessage(),
                    LocalDateTime.now()
            );

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
 
}
