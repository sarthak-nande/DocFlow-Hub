package com.docflowhub.docflow_hub.service;

import org.springframework.web.multipart.MultipartFile;

public interface DocumentStorageService {
	
	String uploadFile(MultipartFile file);

}
