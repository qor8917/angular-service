package com.poc.nestfield.domain;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection="turntable")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TurntableData {
	private String epson1;
	private String epson2;
	private String kuka;
	private String startCommand;
	private double location;
	private double delay;
	long date;
}


