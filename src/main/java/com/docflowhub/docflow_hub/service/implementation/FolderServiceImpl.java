package com.docflowhub.docflow_hub.service.implementation;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.docflowhub.docflow_hub.entity.Folders;
import com.docflowhub.docflow_hub.entity.Users;
import com.docflowhub.docflow_hub.repository.DocumentRepository;
import com.docflowhub.docflow_hub.repository.FolderRepository;
import com.docflowhub.docflow_hub.repository.UserRepository;
import com.docflowhub.docflow_hub.service.FolderService;

@Service
public class FolderServiceImpl implements FolderService {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    private Users getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));
    }

    private String sanitizeId(String id) {
        if (id == null || id.trim().isEmpty() 
                || "null".equalsIgnoreCase(id.trim()) 
                || "undefined".equalsIgnoreCase(id.trim())) {
            return null;
        }
        return id.trim();
    }

    @Override
    public Folders createFolder(String folderName, String parentId) {
        Users user = getAuthenticatedUser();
        String companyId = user.getOrganizationId();
        final String sanitizedParentId = sanitizeId(parentId);

        List<String> ancestorIds = new ArrayList<>();

        if (sanitizedParentId != null) {
            Folders parentFolder = folderRepository.findByIdAndCompanyId(sanitizedParentId, companyId)
                    .orElseThrow(() -> new RuntimeException("Parent folder not found or does not belong to company"));

            if (parentFolder.getAncestorIds() != null) {
                ancestorIds.addAll(parentFolder.getAncestorIds());
            }
            ancestorIds.add(parentFolder.getId());
        }

        boolean exists = folderRepository.existsByCompanyIdAndParentIdAndName(companyId, sanitizedParentId, folderName.trim());
        if (exists) {
            throw new RuntimeException("A folder with this name already exists in this location");
        }

        Folders folder = new Folders(
                folderName.trim(),
                companyId,
                sanitizedParentId,
                ancestorIds,
                user.getEmail()
        );

        return folderRepository.save(folder);
    }

    @Override
    public Folders updateFolderName(String folderId, String newName) {
        Users user = getAuthenticatedUser();
        String companyId = user.getOrganizationId();
        final String sanitizedFolderId = sanitizeId(folderId);

        if (sanitizedFolderId == null) {
            throw new RuntimeException("Folder ID is required");
        }

        Folders folder = folderRepository.findByIdAndCompanyId(sanitizedFolderId, companyId)
                .orElseThrow(() -> new RuntimeException("Folder not found or does not belong to company"));

        boolean nameExists = folderRepository.existsByCompanyIdAndParentIdAndName(
                companyId, folder.getParentId(), newName.trim());

        if (nameExists && !folder.getName().equalsIgnoreCase(newName.trim())) {
            throw new RuntimeException("A folder with the name '" + newName.trim() + "' already exists in this location");
        }

        folder.setName(newName.trim());
        return folderRepository.save(folder);
    }

    @Override
    public boolean deleteFolder(String folderId) {
        Users user = getAuthenticatedUser();
        String companyId = user.getOrganizationId();
        final String sanitizedFolderId = sanitizeId(folderId);

        if (sanitizedFolderId == null) {
            return false;
        }

        Optional<Folders> folderOptional = folderRepository.findByIdAndCompanyId(sanitizedFolderId, companyId);
        if (folderOptional.isEmpty()) {
            return false;
        }

        // Collect the target folder and all nested descendant folder IDs
        List<Folders> descendants = folderRepository.findByCompanyIdAndAncestorIdsContaining(companyId, sanitizedFolderId);
        List<String> allFolderIdsToDelete = new ArrayList<>();
        allFolderIdsToDelete.add(sanitizedFolderId);

        for (Folders descendant : descendants) {
            allFolderIdsToDelete.add(descendant.getId());
        }

        // Delete all documents residing in any of these folders
        documentRepository.deleteByCompanyIdAndFolderIdIn(companyId, allFolderIdsToDelete);

        // Delete all folders
        folderRepository.deleteByCompanyIdAndIdIn(companyId, allFolderIdsToDelete);

        return true;
    }

    @Override
    public List<Folders> getSubFolders(String parentId) {
        Users user = getAuthenticatedUser();
        final String sanitizedParentId = sanitizeId(parentId);
        return folderRepository.findByCompanyIdAndParentId(user.getOrganizationId(), sanitizedParentId);
    }
    
    @Override
    public List<Folders> getAllFoldersByOrganization() {
        Users user = getAuthenticatedUser();
        String organizationId = user.getOrganizationId(); // or user.getOrganizationId() depending on your entity field name
        
        return folderRepository.findByCompanyId(organizationId);
    }
}