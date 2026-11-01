package com.docflowhub.docflow_hub.dto;

public record FileUploadResponseDto(
    String fileName,
    String fileType,
    long fileSize,
    String filePath,
    String message
) {}
