package com.docflowhub.docflow_hub.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.docflowhub.docflow_hub.entity.ActivationLink;

@Repository
public interface AccountActivationLinkRepository extends MongoRepository<ActivationLink, String>{
	
	Optional<ActivationLink> findByToken(String token);
	
	ActivationLink save(ActivationLink activationLink);
}
