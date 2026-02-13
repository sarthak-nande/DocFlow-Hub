package com.docflowhub.docflow_hub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "documents") // Collection name in Atlas
public class UserDocument {
    @Id
    private String id;
    private String title;
    private String status;

    public UserDocument(String title, String status) {
        this.title = title;
        this.status = status;
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getStatus() { return status; }
}
