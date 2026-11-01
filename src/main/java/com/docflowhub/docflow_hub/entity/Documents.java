package com.docflowhub.docflow_hub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Document(collection = "documents")
@CompoundIndexes({
    @CompoundIndex(name = "company_folder_idx", def = "{'companyId': 1, 'folderId': 1}"),
    @CompoundIndex(name = "company_doc_name_idx", def = "{'companyId': 1, 'folderId': 1, 'documentName': 1}")
})
public class Documents extends BaseEntity {

    @Id
    private String id;

    @NotBlank(message = "Company Id Is Required")
    @Indexed
    private String companyId;

    // null represents the root directory for this company
    @Indexed
    private String folderId;

    @NotBlank(message = "UploadBy Is Required")
    private String uploadBy;

    @NotBlank(message = "Document Name Is Required")
    private String documentName;

    @NotBlank(message = "Document Path Is Required")
    private String documentPath;

    @NotBlank(message = "Document Type Is Required")
    private String documentType;

    private long fileSize;

    @NotBlank(message = "Document Version Is Required")
    private String documentVersion;

    @NotNull(message = "Document Status Is Required")
    private Status status;

    public Documents() {
    }

    public Documents(String companyId, String folderId, String uploadBy, String documentName,
                     String documentPath, String documentType, long fileSize,
                     String documentVersion, Status status) {
        super();
        this.companyId = companyId;
        this.folderId = folderId;
        this.uploadBy = uploadBy;
        this.documentName = documentName;
        this.documentPath = documentPath;
        this.documentType = documentType;
        this.fileSize = fileSize;
        this.documentVersion = documentVersion;
        this.status = status;
    }

    public String getId() {
        return id;
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

    public String getFolderId() {
        return folderId;
    }

    public void setFolderId(String folderId) {
        this.folderId = folderId;
    }

    public String getUploadBy() {
        return uploadBy;
    }

    public void setUploadBy(String uploadBy) {
        this.uploadBy = uploadBy;
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

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getDocumentVersion() {
        return documentVersion;
    }

    public void setDocumentVersion(String documentVersion) {
        this.documentVersion = documentVersion;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Documents [id=" + id + ", companyId=" + companyId + ", folderId=" + folderId
                + ", documentName=" + documentName + ", documentPath=" + documentPath
                + ", documentType=" + documentType + ", fileSize=" + fileSize
                + ", documentVersion=" + documentVersion + ", status=" + status + "]";
    }
}