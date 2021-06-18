package com.poc.nestfield.amqp;

import java.io.ByteArrayInputStream;
import java.lang.reflect.Array;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Future;
import java.util.function.BinaryOperator;

import org.apache.catalina.core.StandardHost;
import org.bson.types.Binary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.support.MessageBatch;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.util.StopWatch;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.fasterxml.jackson.databind.node.BinaryNode;
import com.poc.nestfield.converter.Converter;
import com.poc.nestfield.domain.Equip;
import com.poc.nestfield.service.NestfieldService;

public class Receiver {

	protected Logger logger = LoggerFactory.getLogger(getClass());


	Converter converter = new Converter();
	
	@Autowired
	NestfieldService nfService;

	
	

	@RabbitListener(queues = "#{autoDeleteQueue1.name}")
	public void receive1(byte[] in, Message msg) throws InterruptedException {
		receive(in, msg, 1);
	}



	public void receive(byte[] in, Message msg, int receiver) {	
		List<String> hex = converter.byteArrayToHex(in);
		
		String key = msg.getMessageProperties().getReceivedRoutingKey();
		
		String splitted = key.split(".PnP_System.")[1]; //  => Epson_Robot_System_01.Epson1_Turntable_Status
	
		Equip equip = new Equip();
		
		equip.setName(splitted);

		nfService.pushData(equip, hex);
	}
}