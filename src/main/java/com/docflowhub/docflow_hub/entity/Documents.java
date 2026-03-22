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
	private String companyId;
	
	@NotBlank(message="Document Name Is Required")
	private String documentName;
	
	@NotBlank(message="Document Path Is Required")
	private String documentPath;
	
	@NotBlank(message="Document Type Is Required")
	private String documentType;
	
	@NotBlank(message="Document Version Is Required")
	private String documentVersion;
	
	@NotBlank(message="Document Status Is Required")
	private Status status;
	
	@NotBlank(message="Previous Docuemnt Path Is Required")
	private List<String> previousDocumentPath;
	
	public Documents() {
		
	}

	public Documents(String companyId, String documentName, String documentPath, String documentType,
			String documentVersion,Status status, List<String> previousDocumentPath) {
		super();
		companyId = this.companyId;
		documentName = this.documentName;
		documentPath = this.documentPath;
		documentType = this.documentType;
		documentVersion = this.documentVersion;
		status = this.status;
		previousDocumentPath = this.previousDocumentPath;
	}


	public String getCompanyId() {
		return companyId;
	}

	public void setCompanyId(String companyId) {
		this.companyId = companyId;
	}

	public String getDocumentName() {
		return documentName;
	}

	public void setDocumentName(String documentName) {
		this.documentName = documentName;
	}

	public String getDocumentPath() {
		return documentPath;
	}

	public void setDocumentPath(String documentPath) {
		this.documentPath = documentPath;
	}

	public String getDocumentType() {
		return documentType;
	}

	public void setDocumentType(String documentType) {
		this.documentType = documentType;
	}

	public String getDocumentVersion() {
		return documentVersion;
	}

	public void setDocumentVersion(String documentVersion) {
		this.documentVersion = documentVersion;
	}

	public String getStatus() {
		return status.name();
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public List<String> getPreviousDocumentPath() {
		return previousDocumentPath;
	}

	public void setPreviousDocumentPath(List<String> previousDocumentPath) {
		this.previousDocumentPath = previousDocumentPath;
	}

	@Override
	public String toString() {
		return "Documents [companyId=" + companyId + ", documentName=" + documentName + ", documentPath=" + documentPath
				+ ", documentType=" + documentType + ", documentVersion=" + documentVersion + ", status=" + status
				+ ", previousDocumentPath=" + previousDocumentPath + "]";
	}

}
