
package com.docflowhub.docflow_hub.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.docflowhub.docflow_hub.entity.Users;

@Repository
public interface UserRepository extends MongoRepository<Users, String>{

	Optional<Users> findByEmail(String username);
}
