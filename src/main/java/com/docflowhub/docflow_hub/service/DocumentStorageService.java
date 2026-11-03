package com.docflowhub.docflow_hub.service;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.docflowhub.docflow_hub.dto.FileUploadResponseDto;
import com.docflowhub.docflow_hub.entity.Documents;
import org.springframework.data.domain.Page;

public interface DocumentStorageService {
    List<FileUploadResponseDto> uploadFiles(MultipartFile[] files, String folderId);
    List<Documents> getDocumentsByFolder(String folderId);
    boolean deleteDocument(String documentId);
    Resource downloadDocument(String documentId);
    Page<Documents> getOrganizationDocuments(int page, int size, String search, String status);
    Documents updateDocumentStatus(String documentId, String newStatus);
}