package com.docflowhub.docflow_hub.service.implementation;

import java.io.InputStream;
import java.net.Authenticator;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

	@Override
	public String uploadFile(MultipartFile file) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (file.isEmpty()) {
			throw new RuntimeException("Uploaded File Is Empty");
		}
		
		String originalFileName = file.getOriginalFilename();
		
		if (originalFileName != null && originalFileName.contains("..")) {
			throw new RuntimeException("File Name Contains Invalid Path Please Upload File With Valid Name: " + originalFileName);
		}
		
		String fileExtension = "";
		
		if (originalFileName != null && originalFileName.contains(".")) {
			fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
		}
		
		String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
		
		try {
			Path targetLocationForFileStorage = this.fileStoragePath.resolve(uniqueFileName);
			
			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, targetLocationForFileStorage, StandardCopyOption.REPLACE_EXISTING);
			}
			
			String filePathString = targetLocationForFileStorage.toString();
			
			String username = authentication.getName();
			Users user = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User Not Found"));
			Documents document = new Documents(
					user.getOrganizationId(),
					username,
					originalFileName,
					filePathString,
					file.getContentType(),
					"1.0",                 
					Status.PENDING_APPROVAL
			);
			
			documentRepository.save(document);
			
			return filePathString;
			
		} catch (Exception e) {
			throw new RuntimeException("Failed During Storing File: " + e.getMessage());
		}
	}
}