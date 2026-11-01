package com.docflowhub.docflow_hub.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.docflowhub.docflow_hub.dto.FileUploadResponseDto;
import com.docflowhub.docflow_hub.entity.Documents;

public interface DocumentStorageService {
    List<FileUploadResponseDto> uploadFiles(MultipartFile[] files, String folderId);
    List<Documents> getDocumentsByFolder(String folderId);
}