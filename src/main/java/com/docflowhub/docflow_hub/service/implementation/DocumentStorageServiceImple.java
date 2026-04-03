package com.docflowhub.docflow_hub.service.implementation;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.docflowhub.docflow_hub.service.DocumentStorageService;

@Service
public class DocumentStorageServiceImple implements DocumentStorageService{
	
	private final Path fileStoragePath;
	
	public DocumentStorageServiceImple(@Value("${file.upload-dir}") String uplDir) {
		this.fileStoragePath = Paths.get(uplDir).toAbsolutePath().normalize();
		
		try {
			Files.createDirectories(this.fileStoragePath);
		} catch (Exception e) {
			throw new RuntimeException("Could Not Able to Create Directory At Specifieed Location");
		}
	}

	@Override
	public String uploadFile(MultipartFile file) {
		if(file.isEmpty()) {
			throw new RuntimeException("Uploaded File Is Empty");
		}
		
		String originalFileName = file.getOriginalFilename();
		
		if(originalFileName.contains("..")) {
			throw new RuntimeException("File Name Contains Invalid Path Please Upload File With Valid Name: " + originalFileName);
		}
		
		String fileExtension = "";
		
		if(originalFileName.contains(".")) {
			fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
		}
		
		String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
		
		try {
			Path targetLocationForFileStorage = this.fileStoragePath.resolve(uniqueFileName);
			
			try(InputStream inputStream = file.getInputStream()){
				Files.copy(inputStream, targetLocationForFileStorage, StandardCopyOption.REPLACE_EXISTING);
			}
			
			return targetLocationForFileStorage.toString();
			
		} catch (Exception e) {
			throw new RuntimeException("Failed During Storing File");
		}
	}

}
