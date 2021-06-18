package com.poc.nestfield.dto;

import java.util.HashMap;
import java.util.List;

import com.poc.nestfield.domain.Equip;
import com.poc.nestfield.domain.Position;
import com.poc.nestfield.domain.Status;
import com.poc.nestfield.domain.Turntable;
import com.poc.nestfield.domain.TurntableData;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class RobotsDTO {
	Equip epson1;
	Equip epson2;
	Equip kuka;

	Turntable turntable;
}
