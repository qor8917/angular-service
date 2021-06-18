package com.poc.nestfield.scheduling;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.mongodb.BasicDBObject;
import com.poc.nestfield.domain.Equip;
import com.poc.nestfield.domain.Position;
import com.poc.nestfield.domain.Turntable;
import com.poc.nestfield.domain.TurntableData;
import com.poc.nestfield.repository.EquipRepository;
import com.poc.nestfield.repository.TurntableRepository;

@Component
public class DataRemove {
	

	@Autowired
	EquipRepository equipRepo;
	
	@Autowired
	MongoTemplate mongoTemplate;
	
	
	@Autowired
	TurntableRepository turntableRepo;
	
	
	@Scheduled(cron="* */10 * * * *")
	public void resetData() {
		
	
		Equip e1 = equipRepo.findByName("Epson_Robot_System_01");
		if(e1 != null) {
			e1.setPosData(e1.getPosData().subList(e1.getPosData().size()-1, e1.getPosData().size()));
			equipRepo.save(e1);
		}
		
		Equip e2 = equipRepo.findByName("Epson_Robot_System_02");
		
		if(e2 != null) {
			e2.setPosData(e2.getPosData().subList(e2.getPosData().size()-1, e2.getPosData().size()));
			equipRepo.save(e2);
		}
				
		Equip kuka = equipRepo.findByName("Kuka_Robot_System");
		
		if(kuka != null) {
			kuka.setPosData(kuka.getPosData().subList(kuka.getPosData().size()-1, kuka.getPosData().size()));
			equipRepo.save(kuka);
		}

		Turntable t = turntableRepo.findByName("Turntable_System");
		
		if(t != null) {
			t.setData(t.getData().subList(t.getData().size()-1, t.getData().size()));
			turntableRepo.save(t);
		}

	
	}

}
