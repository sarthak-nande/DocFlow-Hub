package com.docflowhub.docflow_hub.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.docflowhub.docflow_hub.entity.TempCred;

public interface TempCredRepository extends MongoRepository<TempCred, String>{

	 Optional<TempCred> findByEmail(String email);
}
