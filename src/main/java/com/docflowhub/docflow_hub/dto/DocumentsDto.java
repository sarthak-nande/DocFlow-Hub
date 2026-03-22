package com.docflowhub.docflow_hub.dto;

import java.io.Serializable;
import java.util.List;

import com.docflowhub.docflow_hub.entity.Status;

import jakarta.validation.constraints.NotBlank;

public record DocumentsDto(
		@NotBlank(message="Comapny Id Is Required")
		String companyId,
		
		@NotBlank(message="Document Name Is Required")
		String documentName,
		
		@NotBlank(message="Document Path Is Required")
		String documentPath,
		
		@NotBlank(message="Document Type Is Required")
		String documentType,
		
		@NotBlank(message="Document Version Is Required")
		String documentVersion,
		
		@NotBlank(message="Document Version Is Required")
		Status status,
		
		@NotBlank(message="Previous Docuemnt Path Is Required")
		List<String> previousDocumentPath
) implements Serializable {}
