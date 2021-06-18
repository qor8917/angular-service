package com.poc.nestfield.repository;


import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.poc.nestfield.domain.Turntable;

@Repository
public interface TurntableRepository extends MongoRepository<Turntable, String> {
	Turntable findByName(String name);
	
}
