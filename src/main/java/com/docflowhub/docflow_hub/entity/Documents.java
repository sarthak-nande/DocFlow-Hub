package com.docflowhub.docflow_hub.entity;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Document(collection = "documents")
public class Documents extends BaseEntity {

    @Id
    private String id;
    
    @NotBlank(message = "Company Id Is Required")
    private String companyId;
    
    @NotBlank(message = "UploadBy Is Required")
    private String uploadBy;
    
    @NotBlank(message = "Document Name Is Required")
    private String documentName;
    
    @NotBlank(message = "Document Path Is Required")
    private String documentPath;
    
    @NotBlank(message = "Document Type Is Required")
    private String documentType;
    
    @NotBlank(message = "Document Version Is Required")
    private String documentVersion;
    
    @NotNull(message = "Document Status Is Required") // Fixed: Enums use @NotNull
    private Status status;
    
    
    public Documents() {
    }

    public Documents(String companyId, String uploadBy, String documentName, String documentPath, String documentType,
            String documentVersion, Status status) {
        super();
        this.companyId = companyId; // Fixed constructor assignment
        this.uploadBy = uploadBy;
        this.documentName = documentName;
        this.documentPath = documentPath;
        this.documentType = documentType;
        this.documentVersion = documentVersion;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getUploadBy() {
		return uploadBy;
	}

	public void setUploadBy(String uploadBy) {
		this.uploadBy = uploadBy;
	}

	public void setId(String id) {
        this.id = id;
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

    public Status getStatusEnum() {
        return status;
    }

    public String getStatus() {
        return status != null ? status.name() : null;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Documents [companyId=" + companyId + ", documentName=" + documentName + ", documentPath=" + documentPath
                + ", documentType=" + documentType + ", documentVersion=" + documentVersion + ", status=" + status
                + ", previousDocumentPath=" + "]";
    }
}