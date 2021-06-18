package com.poc.nestfield.dto;

import java.util.HashMap;

import com.poc.nestfield.domain.EquipData;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FourAxisDTO {
	String x;
	String y;
	String z;
	String u;
	String gripper;
	String action;
	long date;
}
