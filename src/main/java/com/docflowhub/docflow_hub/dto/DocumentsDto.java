package com.docflowhub.docflow_hub.dto;

import java.io.Serializable;
import java.util.List;

import jakarta.validation.constraints.NotBlank;

public record DocumentsDto(
		@NotBlank(message="Comapny Id Is Required")
		String CompanyId,
		
		@NotBlank(message="Document Name Is Required")
		String DocumentName,
		
		@NotBlank(message="Document Path Is Required")
		String DocumentPath,
		
		@NotBlank(message="Document Type Is Required")
		String DocumentType,
		
		@NotBlank(message="Document Version Is Required")
		String DocumentVersion,
		
		@NotBlank(message="Previous Docuemnt Path Is Required")
		List<String> PreviousDocumentPath
) implements Serializable {}
