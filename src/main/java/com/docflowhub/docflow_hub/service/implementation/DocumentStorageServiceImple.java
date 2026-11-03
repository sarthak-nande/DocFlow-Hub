package com.docflowhub.docflow_hub.service.implementation;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.docflowhub.docflow_hub.dto.FileUploadResponseDto;
import com.docflowhub.docflow_hub.entity.Documents;
import com.docflowhub.docflow_hub.entity.Folders;
import com.docflowhub.docflow_hub.entity.Status;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.repository.DocumentRepository;
import com.docflowhub.docflow_hub.repository.FolderRepository;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.DocumentStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
public class DocumentStorageServiceImple implements DocumentStorageService {

    private final Path fileStoragePath;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    public DocumentStorageServiceImple(@Value("${file.upload-dir}") String uplDir) {
        this.fileStoragePath = Paths.get(uplDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStoragePath);
        } catch (Exception e) {
            throw new RuntimeException("Could not create directory at specified location: " + e.getMessage());
        }
    }

    @Override
    public List<FileUploadResponseDto> uploadFiles(MultipartFile[] files, String folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Users user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        String companyId = user.getOrganizationId();

        // Sanitize into a separate, effectively final variable
        final String targetFolderId;
        if (folderId == null || folderId.trim().isEmpty() 
                || "null".equalsIgnoreCase(folderId.trim()) 
                || "undefined".equalsIgnoreCase(folderId.trim())) {
            targetFolderId = null;
        } else {
            targetFolderId = folderId.trim();
        }

        // Now safe to use inside lambdas
        if (targetFolderId != null) {
            Folders targetFolder = folderRepository.findById(targetFolderId)
                    .orElseThrow(() -> new RuntimeException("Target folder not found with ID: " + targetFolderId));

            if (!companyId.equals(targetFolder.getCompanyId())) {
                throw new RuntimeException("Unauthorized: Folder belongs to another company");
            }
        }

        List<FileUploadResponseDto> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            String originalFileName = file.getOriginalFilename();

            if (originalFileName != null && originalFileName.contains("..")) {
                responses.add(new FileUploadResponseDto(
                        originalFileName,
                        file.getContentType(),
                        file.getSize(),
                        null,
                        "Error: Invalid path sequence in filename: " + originalFileName
                ));
                continue;
            }

            String cleanDocumentName = originalFileName;
            if (cleanDocumentName != null && cleanDocumentName.contains("/")) {
                cleanDocumentName = cleanDocumentName.substring(cleanDocumentName.lastIndexOf("/") + 1);
            }

            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            try {
                Path targetLocation = this.fileStoragePath.resolve(uniqueFileName);

                try (InputStream inputStream = file.getInputStream()) {
                    Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
                }

                String filePathString = targetLocation.toString();

                // Pass the sanitized targetFolderId here
                Documents document = new Documents(
                        companyId,
                        targetFolderId,
                        username,
                        cleanDocumentName,
                        filePathString,
                        file.getContentType(),
                        file.getSize(),
                        "1.0",
                        Status.PENDING_APPROVAL
                );

                documentRepository.save(document);

                responses.add(new FileUploadResponseDto(
                        cleanDocumentName,
                        file.getContentType(),
                        file.getSize(),
                        filePathString,
                        "File Stored Successfully"
                ));

            } catch (Exception e) {
                responses.add(new FileUploadResponseDto(
                        cleanDocumentName,
                        file.getContentType(),
                        file.getSize(),
                        null,
                        "Failed to store file: " + e.getMessage()
                ));
            }
        }

        return responses;
    }
    
    @Override
    public List<Documents> getDocumentsByFolder(String folderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Users user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        String companyId = user.getOrganizationId();

        // Sanitize folderId
        final String targetFolderId;
        if (folderId == null || folderId.trim().isEmpty() 
                || "null".equalsIgnoreCase(folderId.trim()) 
                || "undefined".equalsIgnoreCase(folderId.trim())) {
            targetFolderId = null;
        } else {
            targetFolderId = folderId.trim();
        }

        // Fetch documents from the repository
        return documentRepository.findByCompanyIdAndFolderId(companyId, targetFolderId);
    }
    
    @Override
    public boolean deleteDocument(String documentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Users user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        Documents document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        // Security check
        if (!user.getOrganizationId().equals(document.getCompanyId())) {
            throw new RuntimeException("Unauthorized to delete this document");
        }

        try {
            // Delete the physical file from the server
            Path filePath = Paths.get(document.getDocumentPath());
            Files.deleteIfExists(filePath);

            // Delete the database record
            documentRepository.delete(document);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete the document file: " + e.getMessage());
        }
    }

    @Override
    public Resource downloadDocument(String documentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        Users user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        Documents document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        // Security check
        if (!user.getOrganizationId().equals(document.getCompanyId())) {
            throw new RuntimeException("Unauthorized to download this document");
        }

        try {
            Path filePath = Paths.get(document.getDocumentPath()).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable on the server");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error while downloading file: " + e.getMessage());
        }
    }
    
    @Override
    public Page<Documents> getOrganizationDocuments(int page, int size, String search, String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Users user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String safeSearch = search != null ? search.trim() : "";

        if (status == null || status.equalsIgnoreCase("ALL") || status.trim().isEmpty()) {
            return documentRepository.findByCompanyIdAndDocumentNameContainingIgnoreCase(
                    user.getOrganizationId(), safeSearch, pageable);
        } else {
            return documentRepository.findByCompanyIdAndStatusAndDocumentNameContainingIgnoreCase(
                    user.getOrganizationId(), status.toUpperCase(), safeSearch, pageable);
        }
    }

    @Override
    public Documents updateDocumentStatus(String documentId, String newStatus) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Users user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Role Authorization Check
        if (!user.getRole().contains("ROLE_ADMIN") && !user.getRole().contains("ROLE_APPROVER")) {
            throw new RuntimeException("Unauthorized: You do not have permission to change document status.");
        }

        Documents document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getCompanyId().equals(user.getOrganizationId())) {
            throw new RuntimeException("Unauthorized: Document belongs to another organization.");
        }
        
        document.setStatus(Status.valueOf(newStatus.toUpperCase()));
        return documentRepository.save(document);
    }
}