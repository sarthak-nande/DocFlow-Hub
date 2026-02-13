package com.docflowhub.docflow_hub.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.docflowhub.docflow_hub.entity.UserDocument;

@Repository
public interface DocumentRepository extends MongoRepository<UserDocument, String> {
}