package com.docflowhub.docflow_hub.service.implementation;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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
		// TODO Auto-generated method stub
		return null;
	}

}
