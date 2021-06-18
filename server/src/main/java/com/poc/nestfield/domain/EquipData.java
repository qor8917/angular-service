package com.poc.nestfield.domain;


import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection="equips")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class EquipData {
	private String value;
	private long date;
}


