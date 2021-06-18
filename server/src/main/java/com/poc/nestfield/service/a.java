//package com.poc.nestfield.service;
//
//import java.util.ArrayList;
//import java.util.Collections;
//import java.util.HashMap;
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.mongodb.core.MongoTemplate;
//import org.springframework.data.mongodb.core.query.Criteria;
//import org.springframework.data.mongodb.core.query.Query;
//import org.springframework.data.mongodb.core.query.Update;
//import org.springframework.scheduling.annotation.Async;
//
//import com.poc.nestfield.converter.DataConverter;
//import com.poc.nestfield.domain.Equip;
//import com.poc.nestfield.domain.EquipData;
//import com.poc.nestfield.dto.DataWithNameDTO;
//import com.poc.nestfield.dto.FourAxisDTO;
//import com.poc.nestfield.dto.RobotsDTO;
//import com.poc.nestfield.dto.SixAxisDTO;
//import com.poc.nestfield.repository.EquipRepository;
//
//public class a {
//
//	@Autowired
//	MongoTemplate mongoTemplate;
//
//	@Autowired
//	EquipRepository equipRepo;
//	
//	private int ms = 50;
//	
//	private SixAxisDTO epson1;
//	private SixAxisDTO kuka;
//	private FourAxisDTO epson2;
//	
//	
//	@Async("executor1")
//	public void pushData (Equip msg, List<String> hexList) {
//		
//		DataConverter converter = new DataConverter();
//		HashMap<String, String> map = new HashMap<String, String>();
//		map = converter.hexToDatas(hexList);
//		
//		List<EquipData> list = new ArrayList<>();
//		EquipData data = new EquipData();
//		data.setValue(map.get("value"));
//		long dateValue = Long.parseLong(map.get("timeStamp"));
//		data.setDate(dateValue);
//		list.add(data);
//
//		msg.setData(list);
//		
//		
//		
//		
//		
//		
//		
//		
//		Query query = new Query(Criteria.where("name").is(msg.getName()));
//		
//		Query testQuery = new Query();
//		testQuery.addCriteria(new Criteria().and("name").is(msg.getName()));
//		testQuery.fields().include("name");
//		
//		
//		Equip findData = mongoTemplate.findOne(testQuery, Equip.class);
//		
//		if (findData != null) {
//			// update...
//			Update update = new Update();
//			update.push("data").each(list);
//			mongoTemplate.updateFirst(query, update, "equips");
//		
//		} else {
//			// save....
//			equipRepo.save(msg);
//		}
//		
//		return;
//	}
//	
//	
//	public List<?> splitPositions (List<?> positions,String type) {
//		List<?> result = new ArrayList<>();
//		
//		
//		if (type=="six") {
//			List<SixAxisDTO> splittedPositions = new ArrayList<SixAxisDTO>();
//			
//			int size = positions.size();
//			for(int i=0; i<size; i++) {
//				if(i == size-1) break;
//				SixAxisDTO curPos = (SixAxisDTO) positions.get(i);
//				SixAxisDTO nextPos = (SixAxisDTO) positions.get(i+1);
//				splittedPositions.add(curPos);
//				
//				if (nextPos != null && curPos.getDate() != nextPos.getDate()) {
//					long curDate = curPos.getDate();
//					long nextDate = nextPos.getDate();
//					long gap = nextDate - curDate;
//					int lengthNeedToBePushed = (int) gap/ms;
//					if(lengthNeedToBePushed > 0) {
//						
//						for (int j =1; j<=lengthNeedToBePushed; j++) {
//							SixAxisDTO timeAddedPosition = new SixAxisDTO();
//							timeAddedPosition.setDate(curPos.getDate() + ms*j);
//							timeAddedPosition.setX(curPos.getX());
//							timeAddedPosition.setY(curPos.getY());
//							timeAddedPosition.setZ(curPos.getZ());
//							timeAddedPosition.setU(curPos.getU());
//							timeAddedPosition.setV(curPos.getV());
//							timeAddedPosition.setW(curPos.getW());
//							
//							if (gap <10000) {
//								float gapX = Float.parseFloat(nextPos.getX()) - Float.parseFloat(curPos.getX());
//								float gapY = Float.parseFloat(nextPos.getY()) - Float.parseFloat(curPos.getY());
//								float gapZ = Float.parseFloat(nextPos.getZ()) - Float.parseFloat(curPos.getZ());
//								float gapU = Float.parseFloat(nextPos.getU()) - Float.parseFloat(curPos.getU());
//								float gapV = Float.parseFloat(nextPos.getV()) - Float.parseFloat(curPos.getV());
//								float gapW = Float.parseFloat(nextPos.getW()) - Float.parseFloat(curPos.getW());
//								timeAddedPosition.setX(Float.toString(Float.parseFloat(curPos.getX()) + (gapX * j/lengthNeedToBePushed)));
//								timeAddedPosition.setY(Float.toString(Float.parseFloat(curPos.getY()) + (gapY * j/lengthNeedToBePushed)));
//								timeAddedPosition.setZ(Float.toString(Float.parseFloat(curPos.getZ()) + (gapZ * j/lengthNeedToBePushed)));
//								timeAddedPosition.setU(Float.toString(Float.parseFloat(curPos.getU()) + (gapU * j/lengthNeedToBePushed)));
//								timeAddedPosition.setV(Float.toString(Float.parseFloat(curPos.getV()) + (gapV * j/lengthNeedToBePushed)));
//								timeAddedPosition.setW(Float.toString(Float.parseFloat(curPos.getW()) + (gapW * j/lengthNeedToBePushed)));
//								}
//							splittedPositions.add(timeAddedPosition);
//						}
//					}
//				}	
//			}
//			
//			result = splittedPositions;
//		}
//		
//		if (type=="four") {
//			List<FourAxisDTO> splittedPositions = new ArrayList<FourAxisDTO>();
//			
//			int size = positions.size();
//			for(int i=0; i<size; i++) {
//				if(i == size-1) break;
//				FourAxisDTO curPos = (FourAxisDTO) positions.get(i);
//				FourAxisDTO nextPos = (FourAxisDTO) positions.get(i+1);
//				splittedPositions.add(curPos);
//				
//				if (nextPos != null && curPos.getDate() != nextPos.getDate()) {
//					long curDate = curPos.getDate();
//					long nextDate = nextPos.getDate();
//					long gap = nextDate - curDate;
//					int lengthNeedToBePushed = (int) gap/ms;
//					if(lengthNeedToBePushed > 0) {
//						
//						for (int j =1; j<=lengthNeedToBePushed; j++) {
//							FourAxisDTO timeAddedPosition = new FourAxisDTO();
//							timeAddedPosition.setDate(curPos.getDate() + ms*j);
//							timeAddedPosition.setX(curPos.getX());
//							timeAddedPosition.setY(curPos.getY());
//							timeAddedPosition.setZ(curPos.getZ());
//							timeAddedPosition.setU(curPos.getU());
//							
//							if (gap <10000) {
//								float gapX = Float.parseFloat(nextPos.getX()) - Float.parseFloat(curPos.getX());
//								float gapY = Float.parseFloat(nextPos.getY()) - Float.parseFloat(curPos.getY());
//								float gapZ = Float.parseFloat(nextPos.getZ()) - Float.parseFloat(curPos.getZ());
//								float gapU = Float.parseFloat(nextPos.getU()) - Float.parseFloat(curPos.getU());
//								timeAddedPosition.setX(Float.toString(Float.parseFloat(curPos.getX()) + (gapX * j/lengthNeedToBePushed)));
//								timeAddedPosition.setY(Float.toString(Float.parseFloat(curPos.getY()) + (gapY * j/lengthNeedToBePushed)));
//								timeAddedPosition.setZ(Float.toString(Float.parseFloat(curPos.getZ()) + (gapZ * j/lengthNeedToBePushed)));
//								timeAddedPosition.setU(Float.toString(Float.parseFloat(curPos.getU()) + (gapU * j/lengthNeedToBePushed)));
//								}
//							splittedPositions.add(timeAddedPosition);
//						}
//					}
//				}	
//			}
//			
//			result = splittedPositions;
//		}
//		
//		
//		return result;
//	
//	}
//	
//	public RobotsDTO getAll (long date) {
//
//		RobotsDTO robots = new RobotsDTO();
//		
//		List<Equip> equips =  equipRepo.findAll();
//		List<Equip> sliced = new ArrayList<Equip>();
//		
//		SixAxisDTO prevEpson1 = new SixAxisDTO();
//		SixAxisDTO prevKuka = new SixAxisDTO();
//		FourAxisDTO prevEpson2 = new FourAxisDTO();
//		
//		for (int i=0; i<equips.size(); i++) {
//			Equip cur = equips.get(i);
//			List<EquipData> curData = cur.getData();
//			Boolean once = true;
//			int k = 0;
//			for (int j=curData.size()-1; j>=0; j--) {
//				if (curData.get(j).getDate() <= date ) {
//					if (once && curData.get(j).getDate() < date+600000 ) {
//						once=false;
//						k = j;
//					}
//					if(cur.getName().contains("Epson1_Axis_")) {
//						char axis = cur.getName().charAt(cur.getName().length()-1);
//						if(axis == 'X') prevEpson1.setX(curData.get(j).getValue());
//						if(axis == 'Y') prevEpson1.setY(curData.get(j).getValue());
//						if(axis == 'Z') prevEpson1.setZ(curData.get(j).getValue());
//						if(axis == 'U') prevEpson1.setU(curData.get(j).getValue());
//						if(axis == 'V') prevEpson1.setV(curData.get(j).getValue());
//						if(axis == 'W') prevEpson1.setW(curData.get(j).getValue());
//					}
//					
//					if(cur.getName().contains("Kuka_Axis_")) {
//						char axis = cur.getName().charAt(cur.getName().length()-1);
//						if(axis == 'X') prevKuka.setX(curData.get(j).getValue());
//						if(axis == 'Y') prevKuka.setY(curData.get(j).getValue());
//						if(axis == 'Z') prevKuka.setZ(curData.get(j).getValue());
//						if(axis == 'A') prevKuka.setU(curData.get(j).getValue());
//						if(axis == 'B') prevKuka.setV(curData.get(j).getValue());
//						if(axis == 'C') prevKuka.setW(curData.get(j).getValue());
//					}
//					
//					if(cur.getName().contains("Epson2_Axis_")) {
//						char axis = cur.getName().charAt(cur.getName().length()-1);
//						if(axis == 'X') prevEpson2.setX(curData.get(j).getValue());
//						if(axis == 'Y') prevEpson2.setY(curData.get(j).getValue());
//						if(axis == 'Z') prevEpson2.setZ(curData.get(j).getValue());
//						if(axis == 'W') prevEpson2.setU(curData.get(j).getValue());
//					}
//					curData =  curData.subList(k+1, curData.size()-1);
//					cur.setData(curData);
//					break;
//				}
//			}
//		}
//		
//		
//		
//		
//		
//		
//		
//		
//		List<DataWithNameDTO> epson1NamedDataList = new ArrayList<DataWithNameDTO>();
//		List<DataWithNameDTO> kukaNamedDataList = new ArrayList<DataWithNameDTO>();
//		List<DataWithNameDTO> epson2NamedDataList = new ArrayList<DataWithNameDTO>();
//		
//		
//		for (int i =0; i<equips.size(); i++) {
//			Equip pickedEquip =  equips.get(i);
//			String name = pickedEquip.getName();
//			
//			if(name.contains("Epson1_Axis_")) {
//				List<EquipData> epson1Data = pickedEquip.getData();
//				int size = epson1Data.size();
//				for (int j=0; j<size; j++) {
//					DataWithNameDTO namedData = new DataWithNameDTO();
//					namedData.setName(name);
//					namedData.setValue(epson1Data.get(j).getValue());
//					namedData.setDate(epson1Data.get(j).getDate());
//					epson1NamedDataList.add(namedData);
//				}
//			}
//			
//			if(name.contains("Kuka_Axis_")) {
//				List<EquipData> kukaData = pickedEquip.getData();
//				int size = kukaData.size();
//				for (int j=0; j<size; j++) {
//					DataWithNameDTO namedData = new DataWithNameDTO();
//					namedData.setName(name);
//					namedData.setValue(kukaData.get(j).getValue());
//					namedData.setDate(kukaData.get(j).getDate());
//					kukaNamedDataList.add(namedData);
//				}
//			}
//			
//			if(name.contains("Epson2_Axis_")) {
//				List<EquipData> epson2Data = pickedEquip.getData();
//				int size = epson2Data.size();
//				for (int j=0; j<size; j++) {
//					DataWithNameDTO namedData = new DataWithNameDTO();
//					namedData.setName(name);
//					namedData.setValue(epson2Data.get(j).getValue());
//					namedData.setDate(epson2Data.get(j).getDate());
//					epson2NamedDataList.add(namedData);
//				}
//			}
//		}
//		
//		
//		Collections.sort(epson1NamedDataList,(a,b) -> Long.valueOf(a.getDate()).compareTo(b.getDate()));
//		Collections.sort(kukaNamedDataList,(a,b) -> Long.valueOf(a.getDate()).compareTo(b.getDate()));
//		Collections.sort(epson2NamedDataList,(a,b) -> Long.valueOf(a.getDate()).compareTo(b.getDate()));
//		
//		SixAxisDTO epson1 = new SixAxisDTO();
//		epson1 = prevEpson1;
//		epson1.setU("90.189");
//		SixAxisDTO kuka = new SixAxisDTO();
//		kuka = prevKuka;
//		FourAxisDTO epson2 = new FourAxisDTO();
//		epson2  = prevEpson2;
//		epson2.setU("90");
//		System.out.println(prevEpson1);
//		System.out.println(prevKuka);
//		System.out.println(prevEpson2);
//		
////		List<SixAxisDTO> epson1Res = (List<SixAxisDTO>) splitPositions(go6(epson1NamedDataList,0,epson1,new ArrayList<SixAxisDTO>()),"six");
////		List<SixAxisDTO> kukaRes = (List<SixAxisDTO>) splitPositions(go6(kukaNamedDataList,0,new SixAxisDTO(),new ArrayList<SixAxisDTO>()),"six");
////		List<FourAxisDTO> epson2Res = (List<FourAxisDTO>) splitPositions(go4(epson2NamedDataList,0,epson2,new ArrayList<FourAxisDTO>()),"four");
//
//		List<SixAxisDTO> epson1Res = (List<SixAxisDTO>) go6(epson1NamedDataList,0,epson1,new ArrayList<SixAxisDTO>());
//		List<SixAxisDTO> kukaRes = (List<SixAxisDTO>) go6(kukaNamedDataList,0,kuka,new ArrayList<SixAxisDTO>());
//		List<FourAxisDTO> epson2Res = (List<FourAxisDTO>) go4(epson2NamedDataList,0,epson2,new ArrayList<FourAxisDTO>());
//		
//		robots.setEpson1(epson1Res);
//		robots.setKuka(kukaRes);
//		robots.setEpson2(epson2Res);
//		
//		return robots;
//	}
//	
//	
//	public List<SixAxisDTO> go6 (List<DataWithNameDTO> list,int i,SixAxisDTO prev,List<SixAxisDTO> res) {
//		if (i == list.size()-1) return res;
//		
//		DataWithNameDTO curD = list.get(i);
//		SixAxisDTO curP = new SixAxisDTO();
//		curP.setX(prev.getX());
//		curP.setY(prev.getY());
//		curP.setZ(prev.getZ());
//		curP.setU(prev.getU());
//		curP.setV(prev.getV());
//		curP.setW(prev.getW());
//		curP.setDate(curD.getDate());
//		char axis = curD.getName().charAt(curD.getName().length()-1);
//		if(axis == 'X') curP.setX(curD.getValue());
//		if(axis == 'Y') curP.setY(curD.getValue());
//		if(axis == 'Z') curP.setZ(curD.getValue());
//		if(axis == 'U') curP.setU(curD.getValue());
//		if(axis == 'V') curP.setV(curD.getValue());
//		if(axis == 'W') curP.setW(curD.getValue());
//		if(axis == 'A') curP.setU(curD.getValue());
//		if(axis == 'B') curP.setV(curD.getValue());
//		if(axis == 'C') curP.setW(curD.getValue());
//		
//		if (curD.getDate() != list.get(i+1).getDate()) res.add(curP);
//			
//		prev = curP;
//		
//		return go6(list,i+1,prev,res);
//	}
//	
//	public List<FourAxisDTO> go4 (List<DataWithNameDTO> list,int i,FourAxisDTO prev,List<FourAxisDTO> res) {
//		if (i == list.size()-1) return res;
//		
//		DataWithNameDTO curD = list.get(i);
//		FourAxisDTO curP = new FourAxisDTO();
//		curP.setX(prev.getX());
//		curP.setY(prev.getY());
//		curP.setZ(prev.getZ());
//		curP.setU(prev.getU());
//		curP.setDate(curD.getDate());
//		char axis = curD.getName().charAt(curD.getName().length()-1);
//		if(axis == 'X') curP.setX(curD.getValue());
//		if(axis == 'Y') curP.setY(curD.getValue());
//		if(axis == 'Z') curP.setZ(curD.getValue());
//		if(axis == 'U') curP.setU(curD.getValue());
//		
//		if (curD.getDate() != list.get(i+1).getDate()) res.add(curP);
//		prev = curP;
//		
//		return go4(list,i+1,prev,res);
//	}
//	
//	
//
//
//	
//}
