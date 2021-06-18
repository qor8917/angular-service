package com.poc.nestfield.robots;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.poc.nestfield.dto.SixAxisDTO;



//위치 정보에 따른 딜레이 계산용 클래스.
public class Calculator {
	
	private String[] kukaBASE1 = new String[] {"280.042694","0.000000","550.232666","-180.000000","0.000000","180.000000"};
	private String[] kukaBASE2 = new String[] {"280.042694","0.000000","550.232666","-180.000000","0.000000","180.000000"};
	private String[] kukaRU = new String[] {"462.095734","-51.460060","217.093109","179.984039","-0.044342","-179.995407"};
	private String[] kukaRDP = new String[] {"462.426819","-51.465630","142.352493","179.984039","-0.044342","-179.995407"};
	private String[] kukaRDD = new String[] {"462.042480","-51.465630","147.852875","179.984039","-0.044342","-179.995407"};
	private String[] kukaLU = new String[] {"462.486450","51.489750","217.427124","179.984039","-0.044343","-179.995407"};
	private String[] kukaLDP = new String[] {"462.426819","51.483578","142.352493","179.984039","-0.044343","-179.995407"};
	private String[] kukaLDD = new String[] {"462.906281","51.536919","147.956131","179.984039","-0.044343","-179.995407"};
	
	
	private String[] epson1HOME = new String[] {"0.160","346.848","510.079","90.189","-0.223","-179.451"};
	private String[] epson1RU = new String[] {"49.640","443.551","179.995","90.250","0.167","-179.765"};
	private String[] epson1RDP = new String[] {"49.640","443.551","143.782","90.250","0.167","-179.765"};
	private String[] epson1RDD = new String[] {"49.640","443.551","147.554","90.250","0.167","-179.765"};
	private String[] epson1LU = new String[] {"-52.143","443.709","179.995","90.658","0.130","-179.150"};
	private String[] epson1LDP = new String[] {"-52.143","443.709","143.945","90.658","0.130","-179.150"};
	private String[] epson1LDD = new String[] {"-52.143","443.709","147.554","90.658","0.130","-179.150"};
	
	
	private String[] epson2HOME = new String[] {"0.000","600.000","-10.000","90.000"};
	private String[] epson2CENTER = new String[] {"0.000","600.000","-40.000","90.000"};
	private String[] epson2RU = new String[] {"58.284","574.349","-39.989","88.279"};
	private String[] epson2RDP = new String[] {"58.284","574.349","-88.312","88.293"};
	private String[] epson2RDD = new String[] {"58.284","574.349","-84.023","88.293"};
	private String[] epson2LU = new String[] {"-44.445","580.989","-39.974","88.442"};
	private String[] epson2LDP = new String[] {"-44.445","580.989","-88.298","88.442"};
	private String[] epson2LDD = new String[] {"-44.445","580.989","-84.023","88.442"};
	
	
	private double k_BASE_XU = 0.50;   // BASE -> XU
	private double k_XU_XDP = 0.50;	   // XU -> BASE,XU,XDP,XDD
	private double k_XDP_GrCLOSE = 0;//0.5;// XDP -> XU,GrCLOSE , XDD -> XU,GrOPEN
	private double k_GrCLOSE_XU = 0.4;  // GrCLOSE -> XU, GrOPEN -> XU 
	private double k_XDP_XU = 0.4;     
	private double k_XU_XU = 0.4;      
	private double k_XU_XDD = 0.4;
	private double k_XDD_GrOPEN = 0;//0.46;
	private double k_GrOPEN_XU = 0.4;
	private double k_XDD_XU = 0.4;
	private double k_XU_BASE = 0.50;
	
	private double e1_HOME_XU = 0.5;   // HOME -> kuka와 동일 
	private double e1_XU_XDP = 0.3;
	private double e1_XDP_GrCLOSE = 0;//0.36
	private double e1_GrCLOSE_XU = 0.25;
	private double e1_XDP_XU = 0.25;
	private double e1_XU_XU = 0.25;
	private double e1_XU_XDD = 0.3;
	private double e1_XDD_GrOPEN =0;// 0.36;
	private double e1_GrOPEN_XU = 0.25;
	private double e1_XDD_XU = 0.25;
	private double e1_XU_HOME = 0.5;


	private double e2_HOME_XU = 0.5;    
	private double e2_XU_XDP = 0.4;     
	private double e2_XDP_GrCLOSE =0;// 0.4;
	private double e2_GrCLOSE_XU = 0.4;  
	private double e2_XDP_XU = 0.4;     
	private double e2_XU_CENTER = 0.4;  
	private double e2_CENTER_XU = 0.4;
	private double e2_XU_XDD = 0.4;
	private double e2_XDD_GrOPEN =0;// 0.26;
	private double e2_GrOPEN_XU = 0.23;
	private double e2_XDD_XU = 0.23;
	private double e2_XU_HOME = 0.5;
	
	
	//해당 각 만큼 도는데 걸리는 시간
	private double deg90 = 0.8;
	private double deg180 = 1.5;
	private double deg270 = 2;

	
	public double calcDelay(String prev, String cur) {
		if(cur.contains("kuka")) {
			if(prev.equals("kukaBASE1") || prev.equals("kukaBASE2")) return k_BASE_XU;
			if(prev.equals("kukaRU") || prev.equals("kukaLU")) {
				if(cur.equals("kukaBASE1") || cur.equals("kukaBASE2")) return k_XU_BASE;
				if(cur.equals("kukaRU") || cur.equals("kukaLU")) return k_XU_XU;
				if(cur.equals("kukaRDP") || cur.equals("kukaLDP")) return k_XU_XDP;
				if(cur.equals("kukaRDD") || cur.equals("kukaLDD")) return k_XU_XDD;
			}
			if(prev.equals("kukaRDP") || prev.equals("kukaLDP")) {
				if(cur.equals("kukaRU") || cur.equals("kukaLU")) return k_XDP_XU;
				if(cur.equals("kukaGRIPPER_CLOSE")) return k_XDP_GrCLOSE;
			}
			if(prev.equals("kukaRDD") || prev.equals("kukaLDD")) {
				if(cur.equals("kukaRU") || cur.equals("kukaLU")) return k_XDD_XU;
				if(cur.equals("kukaGRIPPER_OPEN")) return k_XDD_GrOPEN;
			}
			if(prev.equals("kukaGRIPPER_CLOSE")) return k_GrCLOSE_XU;
			if(prev.equals("kukaGRIPPER_OPEN")) return k_GrOPEN_XU;
		}
		if(cur.contains("epson1")) {
			if(prev.equals("epson1HOME")) return e1_HOME_XU;
			if(prev.equals("epson1RU") || prev.equals("epson1LU")) {
				if(cur.equals("epson1HOME")) return e1_XU_HOME;
				if(cur.equals("epson1RU") || cur.equals("epson1LU")) return e1_XU_XU;
				if(cur.equals("epson1RDP") || cur.equals("epson1LDP")) return e1_XU_XDP;
				if(cur.equals("epson1RDD") || cur.equals("epson1LDD")) return e1_XU_XDD;
			}
			if(prev.equals("epson1RDP") || prev.equals("epson1LDP")) {
				if(cur.equals("epson1RU") || cur.equals("epson1LU")) return e1_XDP_XU;
				if(cur.equals("epson1GRIPPER_CLOSE")) return e1_XDP_GrCLOSE;
			}
			if(prev.equals("epson1RDD") || prev.equals("epson1LDD")) {
				if(cur.equals("epson1RU") || cur.equals("epson1LU")) return e1_XDD_XU;
				if(cur.equals("epson1GRIPPER_OPEN")) return e1_XDD_GrOPEN;
			}
			if(prev.equals("epson1GRIPPER_CLOSE")) return e1_GrCLOSE_XU;
			if(prev.equals("epson1GRIPPER_OPEN")) return e1_GrOPEN_XU;
		}
		if(cur.contains("epson2")) {
			if(prev.equals("epson2HOME")) return e2_HOME_XU;
			if(prev.equals("epson2RU") || prev.equals("epson2LU")) {
				if(cur.equals("epson2HOME")) return e2_XU_HOME;
				if(cur.equals("epson2RDP") || cur.equals("epson2LDP")) return e2_XU_XDP;
				if(cur.equals("epson2RDD") || cur.equals("epson2LDD")) return e2_XU_XDD;
				if(cur.equals("epson2CENTER")) return e2_XU_CENTER;
			}
			if(prev.equals("epson2RDP") || prev.equals("epson2LDP")) {
				if(cur.equals("epson2RU") || cur.equals("epson2LU")) return e2_XDP_XU;
				if(cur.equals("epson2GRIPPER_CLOSE")) return e2_XDP_GrCLOSE;
			}
			if(prev.equals("epson2RDD") || prev.equals("epson2LDD")) {
				if(cur.equals("epson2RU") || cur.equals("epson2LU")) return e2_XDD_XU;
				if(cur.equals("epson2GRIPPER_OPEN")) return e2_XDD_GrOPEN;
			}
			if(prev.equals("epson2GRIPPER_CLOSE")) return e2_GrCLOSE_XU;
			if(prev.equals("epson2GRIPPER_OPEN")) return e2_GrOPEN_XU;
			if(prev.equals("epson2CENTER")) return e2_CENTER_XU;
		}
		return 0;
	}
	
	

	public String calcEpson1(String[] arr) {
		String action = "";
		if (Arrays.equals(arr,epson1HOME)) action = "epson1HOME";
		if (Arrays.equals(arr,epson1LU)) action = "epson1LU";
		if (Arrays.equals(arr,epson1LDP)) action = "epson1LDP";
		if (Arrays.equals(arr,epson1LDD)) action = "epson1LDD";
		if (Arrays.equals(arr,epson1RU)) action = "epson1RU";
		if (Arrays.equals(arr,epson1RDP)) action = "epson1RDP";
		if (Arrays.equals(arr,epson1RDD)) action = "epson1RDD";
		return action;
		}
	public String calcEpson2(String[] arr) {
		String action = "";
		if (Arrays.equals(arr,epson2HOME)) action = "epson2HOME";
		if (Arrays.equals(arr,epson2LU)) action = "epson2LU";
		if (Arrays.equals(arr,epson2LDD)) action = "epson2LDD";
		if (Arrays.equals(arr,epson2LDP)) action = "epson2LDP";
		if (Arrays.equals(arr,epson2RU)) action = "epson2RU";
		if (Arrays.equals(arr,epson2RDD)) action = "epson2RDD";
		if (Arrays.equals(arr,epson2RDP)) action = "epson2RDP";
		if (Arrays.equals(arr,epson2CENTER)) action = "epson2CENTER";
		return action;
	}
	public String calcKuka(String[] arr) {
		String action = "";
		if (Arrays.equals(arr,kukaBASE1)) action = "kukaBASE1";
		if (Arrays.equals(arr,kukaBASE2)) action = "kukaBASE2";
		if (Arrays.equals(arr,kukaLU)) action = "kukaLU";
		if (Arrays.equals(arr,kukaLDP)) action = "kukaLDP";
		if (Arrays.equals(arr,kukaLDD)) action = "kukaLDD";
		if (Arrays.equals(arr,kukaRU)) action = "kukaRU";
		if (Arrays.equals(arr,kukaRDP)) action = "kukaRDP";
		if (Arrays.equals(arr,kukaRDD)) action = "kukaRDD";
		return action;
		}
	
	public double calcTurntableDelay (double num) {
		if(num == 0.25) return deg90;
		if(num == 0.5) return deg180;
		if(num == 0.75) return deg270;
		return 0;
	}


}
	