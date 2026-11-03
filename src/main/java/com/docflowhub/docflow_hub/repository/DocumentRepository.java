package com.docflowhub.docflow_hub.repository;


import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.docflowhub.docflow_hub.entity.Documents;

@Repository
public interface DocumentRepository extends MongoRepository<Documents, String> {
	void deleteByCompanyIdAndFolderIdIn(String companyId, List<String> folderIds);
	List<Documents> findByCompanyIdAndFolderId(String companyId, String targetFolderId);
	Page<Documents> findByCompanyIdAndDocumentNameContainingIgnoreCase(String companyId, String documentName, Pageable pageable);

    // New: Fetch documents for a company filtered by status and search term
    Page<Documents> findByCompanyIdAndStatusAndDocumentNameContainingIgnoreCase(String companyId, String status, String documentName, Pageable pageable);
}