package com.docflowhub.docflow_hub.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateFolderNameDto(
    @NotBlank(message = "Folder ID is required")
    String folderId,

    @NotBlank(message = "New folder name is required")
    String newName
) {}