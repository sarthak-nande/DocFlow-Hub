package com.docflowhub.docflow_hub.service.implementation;

import java.io.InputStream;
import java.net.Authenticator;
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
import com.docflowhub.docflow_hub.entity.Status;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.repository.DocumentRepository;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.DocumentStorageService;

@Service
public class DocumentStorageServiceImple implements DocumentStorageService {
	
	private final Path fileStoragePath;
	
	@Autowired
	private DocumentRepository documentRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public DocumentStorageServiceImple(@Value("${file.upload-dir}") String uplDir) {
		this.fileStoragePath = Paths.get(uplDir).toAbsolutePath().normalize();
		
		try {
			Files.createDirectories(this.fileStoragePath);
		} catch (Exception e) {
			throw new RuntimeException("Could Not Able to Create Directory At Specified Location");
		}
	}

	public List<FileUploadResponseDto> uploadFiles(MultipartFile[] files) {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    String username = authentication.getName();
	    
	    Users user = userRepository.findByEmail(username)
	            .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

	    List<FileUploadResponseDto> responses = new ArrayList<>();

	    for (MultipartFile file : files) {
	        if (file.isEmpty()) {
	            continue; // Skip empty files or directories submitted as empty markers
	        }

	        String originalFileName = file.getOriginalFilename();

	        // Prevent path traversal attacks
	        if (originalFileName != null && originalFileName.contains("..")) {
	            responses.add(new FileUploadResponseDto(
	                originalFileName, null, 0, null, "Error: Invalid path sequence in filename"
	            ));
	            continue;
	        }

	        // Extract extension
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

	            Documents document = new Documents(
	                    user.getOrganizationId(),
	                    username,
	                    originalFileName, // Can store the relative folder path if preserved by client
	                    filePathString,
	                    file.getContentType(),
	                    "1.0",
	                    Status.PENDING_APPROVAL
	            );

	            documentRepository.save(document);

	            responses.add(new FileUploadResponseDto(
	                    originalFileName,
	                    file.getContentType(),
	                    file.getSize(),
	                    filePathString,
	                    "File Stored Successfully"
	            ));

	        } catch (Exception e) {
	            responses.add(new FileUploadResponseDto(
	                    originalFileName,
	                    file.getContentType(),
	                    file.getSize(),
	                    null,
	                    "Failed to store file: " + e.getMessage()
	            ));
	        }
	    }

	    return responses;
	}
}