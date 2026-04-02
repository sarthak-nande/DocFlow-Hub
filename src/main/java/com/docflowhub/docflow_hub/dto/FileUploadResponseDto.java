package com.docflowhub.docflow_hub.dto;

public record FileUploadResponseDto(
		String originalFileName,
	    String fileType,
	    long sizeInBytes,
	    String storagePath,
	    String message
) {}
