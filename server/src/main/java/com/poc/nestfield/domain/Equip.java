package com.poc.nestfield.domain;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Document(collection="equips")
public class Equip {
	@Id
	private String id;
	private String name;
	private List<Position> posData;
	private List<Status> statusDta;
}


		
		

