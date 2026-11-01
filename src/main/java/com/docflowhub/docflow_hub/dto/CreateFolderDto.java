package com.docflowhub.docflow_hub.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateFolderDto(
    @NotBlank(message = "Folder name is required")
    String name,
    String parentId // optional; null or empty means root
) {}