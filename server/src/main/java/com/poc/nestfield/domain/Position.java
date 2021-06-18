package com.poc.nestfield.domain;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection="equips")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Position {
	String x;
	String y;
	String z;
	String u;
	String v;
	String w;
	String gripper;
	String action;
	String sensor;
	long date;
}




