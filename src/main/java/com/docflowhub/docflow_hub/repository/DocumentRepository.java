package com.docflowhub.docflow_hub.repository;


import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.docflowhub.docflow_hub.entity.Documents;

@Repository
public interface DocumentRepository extends MongoRepository<Documents, String> {
	void deleteByCompanyIdAndFolderIdIn(String companyId, List<String> folderIds);
	List<Documents> findByCompanyIdAndFolderId(String companyId, String targetFolderId);
}