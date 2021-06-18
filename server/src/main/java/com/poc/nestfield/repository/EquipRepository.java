package com.poc.nestfield.repository;


import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.poc.nestfield.domain.Equip;


@Repository
public interface EquipRepository extends MongoRepository<Equip, String> {
	Equip findByName(String name);
	
}
