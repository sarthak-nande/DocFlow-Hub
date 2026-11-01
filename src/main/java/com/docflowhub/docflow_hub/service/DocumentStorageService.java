package com.docflowhub.docflow_hub.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.docflowhub.docflow_hub.dto.FileUploadResponseDto;

public interface DocumentStorageService {
	
	List<FileUploadResponseDto> uploadFiles(MultipartFile[] files);

}
