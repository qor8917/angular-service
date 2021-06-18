package com.poc.nestfield.amqp;

import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.poc.nestfield.config.RabbitConfig;

@Component
public class Publisher {
	
	private final RabbitTemplate rabbitTemplate;
	private final Receiver receiver;
	ObjectMapper mapper = new ObjectMapper();
	
	public Publisher(Receiver receiver, RabbitTemplate rabbitTemplate) {
	    this.receiver = receiver;
	    this.rabbitTemplate = rabbitTemplate;
	  }
	
	
	  public void publish(Object msg) throws JsonProcessingException {
		System.out.println(msg.toString());
		System.out.println(RabbitConfig.topic().getName());
		String json = mapper.writeValueAsString(msg);
		System.out.println(json);
	    rabbitTemplate.convertAndSend(RabbitConfig.topic().getName().toString(),"command", json);
	  }
}
