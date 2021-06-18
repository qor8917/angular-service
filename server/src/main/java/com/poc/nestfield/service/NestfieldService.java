package com.poc.nestfield.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

//import com.poc.nestfield.amqp.Publisher;
import com.poc.nestfield.converter.DataConverter;
import com.poc.nestfield.domain.Position;
import com.poc.nestfield.domain.Status;
import com.poc.nestfield.domain.Turntable;
import com.poc.nestfield.domain.TurntableData;
import com.poc.nestfield.domain.Equip;
import com.poc.nestfield.dto.RobotsDTO;
import com.poc.nestfield.repository.EquipRepository;
import com.poc.nestfield.repository.TurntableRepository;
import com.poc.nestfield.robots.Calculator;
import com.poc.nestfield.robots.Splitter;

@Service
public class NestfieldService {
	
	@Autowired
	MongoTemplate mongoTemplate;

	@Autowired
	EquipRepository equipRepo;
	
	@Autowired
	TurntableRepository turntableRepo;
	
	
	
	//마지막 => action을 널에서""로바
	
	private Position epson1Pos = new Position("0.160","346.848","510.079","90.189","-0.223","-179.451","0","","00",0);
	private Position epson2Pos = new Position("0.000","600.000","-10.000","90.000",null,null,"0","","00",0);
	private Position kukaPos = new Position("280.042694","0.000000","550.232666","-180.000000","0.000000","180.000000","0","","00",0);
	private TurntableData turntablePrev= new TurntableData("","","","",0,0,0);
	private Calculator calc = new Calculator(); 
	private Splitter splitter = new Splitter();
	
	
	@Async("executor1")
	public void pushData (Equip equip, List<String> hexList) {
		
	

	DataConverter converter = new DataConverter();
	HashMap<String, String> data = new HashMap<String, String>();
	data = converter.hexToDatas(hexList);
	
	String category = equip.getName().split(Pattern.quote("."))[0]; // => Epson_Robot_System_01.Epson1_Turntable_Status
	String cur = equip.getName().split(Pattern.quote("."))[1];
	Query query = new Query(Criteria.where("name").is(category));
	
	Query testQuery = new Query();
	testQuery.addCriteria(new Criteria().and("name").is(category));
	testQuery.fields().include("name");
//	@Async("executor1")
//	public void pushData (Equip equip, HashMap<String, String> data) {
//		String category = equip.getName().split("\\.")[0]; // => Epson_Robot_System_01.Epson1_Turntable_Status
//		String cur = equip.getName().split("\\.")[1]; 
//		
//		Query query = new Query(Criteria.where("name").is(category));
//		
//		Query testQuery = new Query();
//		testQuery.addCriteria(new Criteria().and("name").is(category));
//		testQuery.fields().include("name");
	

		// turntable   
		if (category.equals("Turntable_System")) {
			if(cur.equals("Turntable_Epson1_Status") || cur.equals("Turntable_Epson2_Status") || cur.equals("Turntable_Kuka_Status")) return;
			
			Turntable turntable = new Turntable(); 
			TurntableData turntableCur = new TurntableData();
			turntableCur.setStartCommand(turntablePrev.getStartCommand());
			turntableCur.setKuka(turntablePrev.getKuka());
			turntableCur.setEpson1(turntablePrev.getEpson1());
			turntableCur.setEpson2(turntablePrev.getEpson2());
			turntableCur.setLocation(turntablePrev.getLocation());
			
			
			if(cur.equals("Turntable_Start_Command")) turntableCur.setStartCommand(data.get("value"));
			if(cur.equals("Epson1_Turntable_Status")) turntableCur.setEpson1(data.get("value"));
			if(cur.equals("Epson2_Turntable_Status")) turntableCur.setEpson2(data.get("value"));
			if(cur.equals("Kuka_Turntable_Status")) turntableCur.setKuka(data.get("value"));
			turntableCur.setDate(Long.parseLong(data.get("timeStamp")));
			
			
		
			// t1이 들어올때...
			if(data.get("value").equals("T1")) {
				// 소수점부분을 구한다
				double num = (turntablePrev.getLocation() - Math.floor(turntablePrev.getLocation()));
				
		
				// cur에 소수점부분을 빼면은,턴테이블을 기본위치로 시계방향으로 돌린다.
				turntableCur.setLocation(turntablePrev.getLocation()-num);
				if(turntablePrev.getLocation()-num < 0) turntableCur.setLocation(0);
				
				turntableCur.setDelay(calc.calcTurntableDelay(num));
				
				//t1이 들어왔음에도 0이라서 움직이지 않는 오류 방지
				if(turntableCur.getDelay() == 0) turntableCur.setDelay(calc.calcTurntableDelay(0.25));
				
				
			}
			
			//t1 다음에 s1,s2,s3들어올때....
			if(turntablePrev.getStartCommand().equals("T1")&& !data.get("value").equals("T1")) {
				// t1 => s1,s2,s3
				if(turntableCur.getStartCommand().equals("S1")) {
					turntableCur.setLocation(turntablePrev.getLocation() + 0.25);
					turntableCur.setDelay(calc.calcTurntableDelay(0.25));
				}
				if(turntableCur.getStartCommand().equals("S2")) {
					turntableCur.setLocation(turntablePrev.getLocation() + 0.5);
					turntableCur.setDelay(calc.calcTurntableDelay(0.5));
				}
				if(turntableCur.getStartCommand().equals("S3")) {
					turntableCur.setLocation(turntablePrev.getLocation() + 0.25);
					turntableCur.setDelay(calc.calcTurntableDelay(0.25));
				}
			}
			
			// 같은 command 안에서 주고받기
			// 스테이터스가 "2" && "2" 일때 반시계방향으로 돌린다. 
			if(turntablePrev.getStartCommand().equals(turntableCur.getStartCommand())) {
	
				if(turntableCur.getStartCommand().equals("S1") && !turntableCur.getEpson1().equals("1") && !turntableCur.getKuka().equals("1")) {
					if(turntablePrev.getEpson1().equals("1")) {
						turntableCur.setLocation(turntablePrev.getLocation() + 0.5);
						turntableCur.setDelay(calc.calcTurntableDelay(0.5));
						}
					if(turntablePrev.getKuka().equals("1")) {
						turntableCur.setLocation(turntablePrev.getLocation() + 0.5);
						turntableCur.setDelay(calc.calcTurntableDelay(0.5));
					}
				}
				if(turntableCur.getStartCommand().equals("S2") && !turntableCur.getEpson2().equals("1") && !turntableCur.getKuka().equals("1")) {
					if(turntablePrev.getEpson2().equals("1")) {
						turntableCur.setLocation(turntablePrev.getLocation() + 0.25);
						turntableCur.setDelay(calc.calcTurntableDelay(0.25));
						}
					if(turntablePrev.getKuka().equals("1")) {
						turntableCur.setLocation(turntablePrev.getLocation() + 0.75);
						turntableCur.setDelay(calc.calcTurntableDelay(0.75));
						}
				}
				
				if(turntableCur.getStartCommand().equals("S3") && !turntableCur.getEpson1().equals("1") && !turntableCur.getEpson2().equals("1") ) {
					if(turntablePrev.getEpson1().equals("1")) {
						turntableCur.setLocation(turntablePrev.getLocation() + 0.25);
						turntableCur.setDelay(calc.calcTurntableDelay(0.25));
						}
					if(turntablePrev.getEpson2().equals("1")) {
						turntableCur.setLocation(turntablePrev.getLocation() + 0.75);
						turntableCur.setDelay(calc.calcTurntableDelay(0.75));
						}
				}
			}
		

			//prev을 cur로  바꿔준다.
			turntablePrev.setDate(turntableCur.getDate());
			turntablePrev.setKuka(turntableCur.getKuka());
			turntablePrev.setEpson1(turntableCur.getEpson1());
			turntablePrev.setEpson2(turntableCur.getEpson2());
			turntablePrev.setDelay(turntableCur.getDelay());
			turntablePrev.setLocation(turntableCur.getLocation());
			turntablePrev.setStartCommand(turntableCur.getStartCommand());
			
			
			// 돌리는 status가 아니면 db에  저장안함;
//			if(turntableCur.getDelay() == 0) return;
		

			
			
			List<TurntableData> list = new ArrayList<>();
			list.add(turntableCur);
			
			turntable.setName(category);
			turntable.setData(list);
			
			Turntable findData = mongoTemplate.findOne(testQuery, Turntable.class);
			
			if (findData != null) {
				// update...
				Update update = new Update();
				update.push("data").each(list);
				mongoTemplate.updateFirst(query, update, "turntable");
			
			} else {
				// save....
				turntableRepo.save(turntable);
			}
			// end push data
			return;
		}
		
		
		
		// equips
		else {
			
			// pos data
			if (cur.contains("Axis")) {
				
				List<Position> list = new ArrayList<>();
				char axis = cur.charAt(cur.length()-1);
				//정해야할것 =새로운포지션,액션,데이트,그리퍼(는 밑에서)
				if (cur.contains("Epson1")) {
					if(axis == 'X') epson1Pos.setX(data.get("value"));
					if(axis == 'Y') epson1Pos.setY(data.get("value"));
					if(axis == 'Z') epson1Pos.setZ(data.get("value"));
					if(axis == 'U') epson1Pos.setU(data.get("value"));
					if(axis == 'V') epson1Pos.setV(data.get("value"));
					if(axis == 'W') epson1Pos.setW(data.get("value"));
					
//					System.out.println(cur);
//					System.out.println(data.get("value"));
//					System.out.println(data.get("timeStamp"));
					
					String[] target = new String[] {epson1Pos.getX(),epson1Pos.getY(),epson1Pos.getZ(),epson1Pos.getU(),epson1Pos.getV(),epson1Pos.getW()};
					String action = calc.calcEpson1(target);
					
				
					epson1Pos.setDate(Long.parseLong(data.get("timeStamp")));
			
					epson1Pos.setAction(action);
					list.add(epson1Pos);
					equip.setPosData(list);
				}
				if (cur.contains("Epson2")) {
					if(axis == 'X') epson2Pos.setX(data.get("value"));
					if(axis == 'Y') epson2Pos.setY(data.get("value"));
					if(axis == 'Z') epson2Pos.setZ(data.get("value"));
					if(axis == 'U') epson2Pos.setU(data.get("value"));
					
//					System.out.println(cur);
//					System.out.println(data.get("value"));
//					System.out.println(data.get("timeStamp"));
					
					String[] target = new String[] {epson2Pos.getX(),epson2Pos.getY(),epson2Pos.getZ(),epson2Pos.getU()};
					String action = calc.calcEpson2(target);
					
	
					epson2Pos.setDate(Long.parseLong(data.get("timeStamp")));

					
					epson2Pos.setAction(action);
					list.add(epson2Pos);
					equip.setPosData(list);
				}
				if (cur.contains("Kuka")) {
					if(axis == 'X') kukaPos.setX(data.get("value"));
					if(axis == 'Y') kukaPos.setY(data.get("value"));
					if(axis == 'Z') kukaPos.setZ(data.get("value"));
					if(axis == 'A') kukaPos.setU(data.get("value"));
					if(axis == 'B') kukaPos.setV(data.get("value"));
					if(axis == 'C') kukaPos.setW(data.get("value"));
					
//					System.out.println(cur);
//					System.out.println(data.get("value"));
//					System.out.println(data.get("timeStamp"));
				
					String[] target = new String[] {kukaPos.getX(),kukaPos.getY(),kukaPos.getZ(),kukaPos.getU(),kukaPos.getV(),kukaPos.getW()};
					String action = calc.calcKuka(target);
					

					kukaPos.setDate(Long.parseLong(data.get("timeStamp")));

					kukaPos.setAction(action);
					list.add(kukaPos);
					equip.setPosData(list);
					
				}
				
				
				// 데이터 넣기전에 이름을 category로 바꿔줌. (컬렉션에 epson1,epson2,kuka,turntalbe 다큐먼트만 남아있게)
				equip.setName(category);
				
				// action 으로 완성되지 않으면 데이터안넣기 (계속 축적은 됨)
				if (equip.getPosData().get(equip.getPosData().size()-1).getAction().equals("")) return;

				Equip findData = mongoTemplate.findOne(testQuery, Equip.class);
		
				if (findData != null) {
					// update...
					Update update = new Update();
					update.push("posData").each(list);
					mongoTemplate.updateFirst(query, update, "equips");
				
				} else {
					// save....
					System.out.print("first");
					equipRepo.save(equip);
				}
				return;
			}
			
			if (cur.contains("Gripper") && data.get("value").equals("1") || data.get("value").equals("0")) {
				List<Position> list = new ArrayList<>();
				//정해야할것 =새로운포지션,액션비교해서 액션,데이트,그리퍼(는 밑에서)
				if (cur.contains("Epson1")) {
					epson1Pos.setGripper(data.get("value"));
					if (data.get("value").equals("1")) epson1Pos.setAction("epson1GRIPPER_CLOSE");
					if (data.get("value").equals("0")) epson1Pos.setAction("epson1GRIPPER_OPEN");
					epson1Pos.setDate(Long.parseLong(data.get("timeStamp")));
					list.add(epson1Pos);
					equip.setPosData(list);
				}
				if (cur.contains("Epson2")) {
					epson2Pos.setGripper(data.get("value"));
					if (data.get("value").equals("1")) epson2Pos.setAction("epson2GRIPPER_CLOSE");
					if (data.get("value").equals("0")) epson2Pos.setAction("epson2GRIPPER_OPEN");
					epson2Pos.setDate(Long.parseLong(data.get("timeStamp")));
					list.add(epson2Pos);
					equip.setPosData(list);
				}
				if (cur.contains("Kuka")) {
					kukaPos.setGripper(data.get("value"));
					if (data.get("value").equals("1")) kukaPos.setAction("kukaGRIPPER_CLOSE");
					if (data.get("value").equals("0")) kukaPos.setAction("kukaGRIPPER_OPEN");
					kukaPos.setDate(Long.parseLong(data.get("timeStamp")));
					list.add(kukaPos);
					equip.setPosData(list);
				}
				
				equip.setName(category);
				Equip findData = mongoTemplate.findOne(testQuery, Equip.class);
				
				if (findData != null) {
					// update...
				
					Update update = new Update();
					update.push("posData").each(list);
					mongoTemplate.updateFirst(query, update, "equips");
				} else {
					// save....
					equipRepo.save(equip);
				}
				return;
			}
			
			// 센서 설정(데이터를 저장하지는않음)
			if(cur.contains("Sensor_Status")) {
				if (cur.contains("Epson1")) {
					epson1Pos.setSensor(data.get("value"));
				}
				if (cur.contains("Epson2")) {
					epson2Pos.setSensor(data.get("value"));
				}
				if (cur.contains("Kuka")) {
					kukaPos.setSensor(data.get("value"));
				}
				return;
			}
			
			
		
		}
		return;
	}
	
	
	
	public RobotsDTO getAll (String date) {
		
		

		RobotsDTO robots = new RobotsDTO();

		
		
		Equip e1 = equipRepo.findByName("Epson_Robot_System_01");
		if(e1 == null) {
			e1 = new Equip();
			List<Position> e1n = new ArrayList<Position>();
			e1n.add(epson1Pos);
			e1.setPosData(e1n);
		}
		Equip e2 = equipRepo.findByName("Epson_Robot_System_02");
		if(e2 == null) {
			e2 = new Equip();
			List<Position> e2n = new ArrayList<Position>();
			e2n.add(epson2Pos);
			e2.setPosData(e2n);
		}
		Equip kuka = equipRepo.findByName("Kuka_Robot_System");
		if(kuka == null) {
			kuka = new Equip();
			List<Position> kn = new ArrayList<Position>();
			kn.add(kukaPos);
			kuka.setPosData(kn);
		}
		Turntable t = turntableRepo.findByName("Turntable_System");
		if(t == null) {
			t = new Turntable();
			List<TurntableData> tn = new ArrayList<TurntableData>(); 
			tn.add(turntablePrev);
			t.setData(tn);
		}

		
		if(date.equals("first")) {			

			List<Position> emptyE1 = new ArrayList<Position>();
			List<Position> emptyE2 = new ArrayList<Position>();
			List<Position> emptyKuka = new ArrayList<Position>();
			List<TurntableData> emptyT = new ArrayList<TurntableData>();

			
			
			emptyE1.add(e1.getPosData().get(e1.getPosData().size()-1));
			e1.setPosData(emptyE1);
			robots.setEpson1(e1);
			
			emptyE2.add(e2.getPosData().get(e2.getPosData().size()-1));
			e2.setPosData(emptyE2);
			robots.setEpson2(e2);
			
			emptyKuka.add(kuka.getPosData().get(kuka.getPosData().size()-1));
			kuka.setPosData(emptyKuka);
			robots.setKuka(kuka);
			
			emptyT.add(t.getData().get(t.getData().size()-1));
//			if(turntablePrev.getStartCommand().equals("")) turntablePrev.setStartCommand(t.getData().get(t.getData().size()-1).getStartCommand());
			t.setData(emptyT);
			robots.setTurntable(t);
			
			
			return robots;
		}
		
		
		String[] dateArr = date.split("@");
		long e1LastDate = Long.parseLong(dateArr[0]);
		long e2LastDate = Long.parseLong(dateArr[1]);
		long kukaLastDate = Long.parseLong(dateArr[2]);
		long turntableLastData = Long.parseLong(dateArr[3]);
		
		
		
		List<Position> e1P = e1.getPosData();
		List<Position> e1PRes = null;
		for (int i=e1P.size()-1; i>=0; i--) {
			if(e1P.get(i).getDate() == e1LastDate) {
				e1PRes = e1P.subList(i,e1P.size());
			}
		}
		if(e1PRes != null) e1.setPosData(splitter.splitPositions(e1PRes));
		
		List<Position> e2P = e2.getPosData();
		List<Position> e2PRes = null;
		for (int i=e2P.size()-1; i>=0; i--) {
			if(e2P.get(i).getDate() == e2LastDate) {
				e2PRes = e2P.subList(i,e2P.size());
			}
		}
		if(e2PRes != null) e2.setPosData(splitter.splitPositions(e2PRes));
		
		List<Position> kukaP = kuka.getPosData();
		List<Position> kukaPRes = null;
		for (int i=kukaP.size()-1; i>=0; i--) {
			if(kukaP.get(i).getDate() == kukaLastDate) {
				kukaPRes = kukaP.subList(i,kukaP.size());
			}
		}
		if(kukaPRes != null) kuka.setPosData(splitter.splitPositions(kukaPRes));
		
		List<TurntableData> turntableD = t.getData();
		List<TurntableData> turntableDRes = null;
		for (int i=turntableD.size()-1; i>=0; i--) {
			if(turntableD.get(i).getDate() == turntableLastData) {
				turntableDRes = turntableD.subList(i,turntableD.size());
			}
		}
		
		if(turntableDRes != null) t.setData(splitter.splitTurntable(turntableDRes));

		robots.setEpson1(e1);
		robots.setEpson2(e2);
		robots.setKuka(kuka);
		robots.setTurntable(t);
		
		
		return robots;
	}

	
}
