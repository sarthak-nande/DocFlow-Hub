package com.docflowhub.docflow_hub.entity;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;


@Document(collection = "documents")
public class Documents extends BaseEntity{

	@Id
	private String id;
	
	@NotBlank(message="Comapny Id Is Required")
	private String CompanyId;
	
	@NotBlank(message="Document Name Is Required")
	private String DocumentName;
	
	@NotBlank(message="Document Path Is Required")
	private String DocumentPath;
	
	@NotBlank(message="Document Type Is Required")
	private String DocumentType;
	
	@NotBlank(message="Document Version Is Required")
	private String DocumentVersion;
	
	@NotBlank(message="Previous Docuemnt Path Is Required")
	private List<String> PreviousDocumentPath;

	public Documents(String companyId, String documentName, String documentPath, String documentType,
			String documentVersion, List<String> previousDocumentPath) {
		super();
		CompanyId = companyId;
		DocumentName = documentName;
		DocumentPath = documentPath;
		DocumentType = documentType;
		DocumentVersion = documentVersion;
		PreviousDocumentPath = previousDocumentPath;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getDocumentName() {
		return DocumentName;
	}

	public void setDocumentName(String documentName) {
		DocumentName = documentName;
	}

	public String getDocumentPath() {
		return DocumentPath;
	}

	public void setDocumentPath(String documentPath) {
		DocumentPath = documentPath;
	}

	public String getDocumentType() {
		return DocumentType;
	}

	public void setDocumentType(String documentType) {
		DocumentType = documentType;
	}

	public String getDocumentVersion() {
		return DocumentVersion;
	}

	public void setDocumentVersion(String documentVersion) {
		DocumentVersion = documentVersion;
	}

	public List<String> getPreviousDocumentPath() {
		return PreviousDocumentPath;
	}

	public void setPreviousDocumentPath(List<String> previousDocumentPath) {
		PreviousDocumentPath = previousDocumentPath;
	}

	@Override
	public String toString() {
		return "Documents [CompanyId=" + CompanyId + ", DocumentName=" + DocumentName + ", DocumentPath=" + DocumentPath
				+ ", DocumentType=" + DocumentType + ", DocumentVersion=" + DocumentVersion + ", PreviousDocumentPath="
				+ PreviousDocumentPath + "]";
	}
	
	
}
