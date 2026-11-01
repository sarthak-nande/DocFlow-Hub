package com.docflowhub.docflow_hub.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.docflowhub.docflow_hub.entity.Folders;

@Repository
public interface FolderRepository extends MongoRepository<Folders, String> {
	
	List<Folders> findByCompanyId(String companyId);

    // Retrieve immediate child folders for a specific parent (or root when parentId is null)
    List<Folders> findByCompanyIdAndParentId(String companyId, String parentId);

    // Retrieve single folder scoped strictly to the company for security
    Optional<Folders> findByIdAndCompanyId(String id, String companyId);

    // Check if a folder with the same name already exists under the same parent
    boolean existsByCompanyIdAndParentIdAndName(String companyId, String parentId, String name);

    // Find a folder by name under a given parent (used when parsing paths recursively)
    Optional<Folders> findByCompanyIdAndParentIdAndName(String companyId, String parentId, String name);

    // Retrieve all folders matching a list of ancestor IDs (used for breadcrumbs)
    List<Folders> findByCompanyIdAndIdIn(String companyId, List<String> ids);

    // Find all sub-tree folders when deleting or moving a parent folder
    List<Folders> findByCompanyIdAndAncestorIdsContaining(String companyId, String folderId);

    // Bulk delete all descendant folders
    void deleteByCompanyIdAndIdIn(String companyId, List<String> folderIds);
}