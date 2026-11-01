package com.docflowhub.docflow_hub.entity;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;

@Document(collection = "folders")
@CompoundIndexes({
    @CompoundIndex(name = "company_parent_folder_idx", def = "{'companyId': 1, 'parentId': 1}"),
    @CompoundIndex(name = "company_folder_name_idx", def = "{'companyId': 1, 'parentId': 1, 'name': 1}", unique = true)
})
public class Folders extends BaseEntity {

    @Id
    private String id;

    @NotBlank(message = "Folder Name Is Required")
    private String name;

    @NotBlank(message = "Company Id Is Required")
    @Indexed
    private String companyId;

    // null means root folder
    @Indexed
    private String parentId;

    // List of ancestor folder IDs from root to immediate parent
    private List<String> ancestorIds = new ArrayList<>();

    // REMOVED: private String createdBy; (It is inherited from BaseEntity)

    public Folders() {
    }

    public Folders(String name, String companyId, String parentId, List<String> ancestorIds, String createdBy) {
        super();
        this.name = name;
        this.companyId = companyId;
        this.parentId = parentId;
        this.ancestorIds = ancestorIds != null ? ancestorIds : new ArrayList<>();
        
        // Use the setter inherited from BaseEntity
        this.setCreatedBy(createdBy); 
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public List<String> getAncestorIds() {
        return ancestorIds;
    }

    public void setAncestorIds(List<String> ancestorIds) {
        this.ancestorIds = ancestorIds;
    }

    // REMOVED: getCreatedBy() and setCreatedBy() (They are inherited from BaseEntity)
}