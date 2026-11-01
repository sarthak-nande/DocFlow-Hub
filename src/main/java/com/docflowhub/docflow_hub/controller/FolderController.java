package com.docflowhub.docflow_hub.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.docflowhub.docflow_hub.dto.CreateFolderDto;
import com.docflowhub.docflow_hub.dto.ErrorResponseDto;
import com.docflowhub.docflow_hub.dto.SuccessResponseDto;
import com.docflowhub.docflow_hub.dto.UpdateFolderNameDto;
import com.docflowhub.docflow_hub.entity.Folders;
import com.docflowhub.docflow_hub.service.FolderService;
import com.docflowhub.docflow_hub.versioning.ApiVersion;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@ApiVersion(1)
@RequestMapping("/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createFolder(@Valid @RequestBody CreateFolderDto createFolderDto, HttpServletRequest request) {
        try {
            Folders folder = folderService.createFolder(createFolderDto.name(), createFolderDto.parentId());

            SuccessResponseDto<Folders> response = new SuccessResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.CREATED,
                    "Folder created successfully",
                    folder,
                    LocalDateTime.now()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            ErrorResponseDto<String> errorResponse = new ErrorResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.BAD_REQUEST,
                    e.getMessage(),
                    LocalDateTime.now()
            );

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/edit/name")
    public ResponseEntity<?> updateFolderName(@Valid @RequestBody UpdateFolderNameDto updateFolderNameDto, HttpServletRequest request) {
        try {
            Folders folder = folderService.updateFolderName(updateFolderNameDto.folderId(), updateFolderNameDto.newName());

            SuccessResponseDto<Folders> response = new SuccessResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.OK,
                    "Folder name updated successfully",
                    folder,
                    LocalDateTime.now()
            );

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            ErrorResponseDto<String> errorResponse = new ErrorResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.BAD_REQUEST,
                    e.getMessage(),
                    LocalDateTime.now()
            );

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/delete/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable("folderId") String folderId, HttpServletRequest request) {
        try {
            boolean isDeleted = folderService.deleteFolder(folderId);

            if (!isDeleted) {
                ErrorResponseDto<String> errorResponse = new ErrorResponseDto<>(
                        request.getRequestURI(),
                        HttpStatus.NOT_FOUND,
                        "Folder not found or unauthorized request",
                        LocalDateTime.now()
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            SuccessResponseDto<String> response = new SuccessResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.OK,
                    "Folder and its contents deleted successfully",
                    "Deleted Folder ID: " + folderId,
                    LocalDateTime.now()
            );

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            ErrorResponseDto<String> errorResponse = new ErrorResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.BAD_REQUEST,
                    e.getMessage(),
                    LocalDateTime.now()
            );

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/subfolders")
    public ResponseEntity<?> getSubFolders(@RequestParam(value = "parentId", required = false) String parentId, HttpServletRequest request) {
        try {
            List<Folders> subFolders = folderService.getSubFolders(parentId);

            SuccessResponseDto<List<Folders>> response = new SuccessResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.OK,
                    "Folders retrieved successfully",
                    subFolders,
                    LocalDateTime.now()
            );

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            ErrorResponseDto<String> errorResponse = new ErrorResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.BAD_REQUEST,
                    e.getMessage(),
                    LocalDateTime.now()
            );

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @GetMapping("/organization/all")
    public ResponseEntity<?> getAllFoldersByOrganization(HttpServletRequest request) {
        try {
            List<Folders> folders = folderService.getAllFoldersByOrganization();

            SuccessResponseDto<List<Folders>> response = new SuccessResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.OK,
                    "All organization folders retrieved successfully",
                    folders,
                    LocalDateTime.now()
            );

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            ErrorResponseDto<String> errorResponse = new ErrorResponseDto<>(
                    request.getRequestURI(),
                    HttpStatus.BAD_REQUEST,
                    e.getMessage(),
                    LocalDateTime.now()
            );

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}