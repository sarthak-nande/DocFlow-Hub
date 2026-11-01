package com.docflowhub.docflow_hub.service;

import java.util.List;
import com.docflowhub.docflow_hub.entity.Folders;

public interface FolderService {
    Folders createFolder(String folderName, String parentId);
    Folders updateFolderName(String folderId, String newName);
    boolean deleteFolder(String folderId);
    List<Folders> getSubFolders(String parentId);
    List<Folders> getAllFoldersByOrganization();
}