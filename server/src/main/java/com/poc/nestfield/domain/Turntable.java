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
@Document(collection="turntable")
public class Turntable {
	@Id
	private String id;
	private String name;
	private List<TurntableData> data;
}


