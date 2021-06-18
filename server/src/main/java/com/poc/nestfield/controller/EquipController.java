package com.poc.nestfield.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.poc.nestfield.domain.Equip;
import com.poc.nestfield.domain.Position;
import com.poc.nestfield.dto.FourAxisDTO;
import com.poc.nestfield.dto.Msg;
import com.poc.nestfield.dto.RobotsDTO;
import com.poc.nestfield.repository.EquipRepository;
import com.poc.nestfield.service.NestfieldService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.poc.nestfield.amqp.Publisher;
//import com.poc.nestfield.amqp.Publisher;
import com.poc.nestfield.converter.DataConverter;

@RestController
@CrossOrigin
public class EquipController {
	
	private static final Logger logger = LoggerFactory.getLogger(EquipController.class);
	private static final String urlRoot = "/api";
	
	@Autowired
	MongoTemplate mongoTemplate;

	@Autowired
	private EquipRepository equipRepo;
	
	@Autowired
	NestfieldService nfService;
	
	@Autowired
	Publisher publisher;
	
	

	@RequestMapping(value = urlRoot + "/robots/{date}", method = RequestMethod.GET)
	@ResponseBody
	public RobotsDTO getAllrobots(@PathVariable("date") String date) {
		return nfService.getAll(date);
	}
	
	@RequestMapping(value = urlRoot + "/msg", method = RequestMethod.POST)
	@ResponseBody
	public void commandReady(@RequestBody Object msg) throws JsonProcessingException {
		publisher.publish(msg);
		return;
	}


	

//	@RequestMapping(value = urlRoot + "/test", method = RequestMethod.POST)
//	@ResponseBody
//	public List<Position> getAllrobots(@RequestBody List<Msg> msg) {
//		
//		
//		
//		msg.forEach(arg -> {
//			nfService.pushData(arg.equip, arg.data);
//		});
//		
//		
//		
//		return null;
//	}
	
}
