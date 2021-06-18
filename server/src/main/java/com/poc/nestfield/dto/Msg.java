package com.poc.nestfield.dto;

import java.util.HashMap;
import java.util.List;

import com.poc.nestfield.domain.Equip;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
public class Msg {
	public Equip equip;
	public HashMap<String,String> data;
}
