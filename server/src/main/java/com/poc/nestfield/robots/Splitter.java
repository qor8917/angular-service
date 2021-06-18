package com.poc.nestfield.robots;

import java.util.ArrayList;
import java.util.List;

import com.poc.nestfield.domain.Position;
import com.poc.nestfield.domain.TurntableData;


//db에 저장된 포지션을 쪼개는(애니메이션화 시키는) 클래스.

public class Splitter {
	
	private int ms = 30;
	private Calculator calc = new Calculator(); 

	public List<Position> splitPositions (List<Position> positions) { 
		List<Position> result = new ArrayList<Position>();
		
		int size = positions.size();
		
		for (int i =0; i<size; i++) {
			// 첫번째 element는 바로 집어넣고 continue (prev가 없기 때문)
			if(i == 0) {
				if(positions.get(0).getAction().equals("epson1HOME") || positions.get(0).getAction().equals("epson2HOME") || positions.get(0).getAction().equals("kukaBASE1") || positions.get(0).getAction().equals("kukaBASE2")) positions.get(0).setSensor(null);
				result.add(positions.get(0));
				continue;
			}

			
			Position cur = positions.get(i);
			Position prev = positions.get(i-1);
		
			double delay = calc.calcDelay(prev.getAction(), cur.getAction());
			long gapDate = cur.getDate() - prev.getDate();
			float gapX = Float.parseFloat(cur.getX()) - Float.parseFloat(prev.getX());
			float gapY = Float.parseFloat(cur.getY()) - Float.parseFloat(prev.getY());
			float gapZ = Float.parseFloat(cur.getZ()) - Float.parseFloat(prev.getZ());
			float gapU = Float.parseFloat(cur.getU()) - Float.parseFloat(prev.getU());
		    Float gapV = null;
			Float gapW = null;

			// 정지시간이 포함되지않은 애니메이션프레임
			int framesNeedAnimation = (int) (delay*1000/ms);
			
			// 시간차가 최소 (n)ms 이상 날때만 프레임화 시켜서 집어넣음
			if(framesNeedAnimation > 0) {
			
				if(cur.getV() != null && cur.getW() != null) {
					gapV = Float.parseFloat(cur.getV()) - Float.parseFloat(prev.getV());
					gapW = Float.parseFloat(cur.getW()) - Float.parseFloat(prev.getW());
				}
				
				

				for(int j = 0; j<=framesNeedAnimation; j++) {
					// prev와 cur이 사이의 현재를 나타내는 포지션
					Position now = new Position();	
					
					now.setDate(prev.getDate() + (long) (gapDate*((double) j/framesNeedAnimation)));
//					if(j == framesNeedAnimation) now.setDate(cur.getDate());
					
					now.setGripper(prev.getGripper());
					now.setSensor(cur.getSensor());
					if(cur.getAction().equals("epson1HOME") || cur.getAction().equals("epson2HOME") || cur.getAction().equals("kukaBASE1") || cur.getAction().equals("kukaBASE2")) now.setSensor(prev.getSensor());
					if(now.getGripper().equals("1") && now.getSensor().equals("01")) now.setSensor("SLR00");
					if(now.getGripper().equals("1") && now.getSensor().equals("10")) now.setSensor("SLR00");
					if(now.getGripper().equals("1") && now.getSensor().equals("SLR10")) now.setSensor("SLR00");
					if(now.getGripper().equals("1") && now.getSensor().equals("SLR01")) now.setSensor("SLR00");
					
					if(framesNeedAnimation > 0) {
					now.setX(Float.toString(Float.parseFloat(prev.getX()) + (float)(gapX*((float) j/framesNeedAnimation))));
					now.setY(Float.toString(Float.parseFloat(prev.getY()) + (float)(gapY*((float) j/framesNeedAnimation))));
					now.setZ(Float.toString(Float.parseFloat(prev.getZ()) + (float)(gapZ*((float) j/framesNeedAnimation))));
					now.setU(Float.toString(Float.parseFloat(prev.getU()) + (float)(gapU*((float) j/framesNeedAnimation))));
					
					if(gapV != null && gapW!= null) {
						now.setV(Float.toString(Float.parseFloat(prev.getV()) + (float)(gapV*((float) j/framesNeedAnimation))));
						now.setW(Float.toString(Float.parseFloat(prev.getW()) + (float)(gapW*((float) j/framesNeedAnimation))));
					}
					} else {
						now.setX(prev.getX());
						now.setY(prev.getY());
						now.setZ(prev.getZ());
						now.setU(prev.getU());
						now.setV(prev.getV());
						now.setW(prev.getW());
					}
					
					
					result.add(now);
					
				}
			}
		}
		
		
	return result;

	}
	
	public List<TurntableData> splitTurntable(List<TurntableData> dataList) {

		List<TurntableData>  result = new ArrayList<TurntableData>();
		
		int size = dataList.size();
		
		for (int i =0; i<size; i++) {
			// 첫번째 element는 바로 집어넣고 continue (prev가 없기 때문)
			if(i == 0) {
				result.add(dataList.get(0));
				continue;
			}
			
			TurntableData cur = dataList.get(i);
			TurntableData prev = dataList.get(i-1);
			double delay = cur.getDelay();
			double gap = cur.getLocation() - prev.getLocation();
			long gapDate = cur.getDate() - prev.getDate();
			int framesNeedAnimation = (int) (delay*1000/ms);
			
			if(delay == 0) {
				result.add(dataList.get(i));
				continue;
			}
			
			for(int j = 0; j<=framesNeedAnimation; j++) {
				// prev와 cur이 사이의 현재를 나타내는 포지션
				TurntableData now = new TurntableData();	
				
				now.setLocation(prev.getLocation() + (double) (gap*((double) j/framesNeedAnimation)));
				now.setDate(prev.getDate() + (long) (gapDate*((double) j/framesNeedAnimation)));
				now.setEpson1(cur.getEpson1());
				now.setEpson2(cur.getEpson2());
				now.setKuka(cur.getKuka());
				now.setStartCommand(cur.getStartCommand());
				
				
				result.add(now);
			}
		}
		
		return result;
		}
	
}
