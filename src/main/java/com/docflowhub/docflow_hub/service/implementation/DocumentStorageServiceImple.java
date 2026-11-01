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
}