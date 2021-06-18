package com.poc.nestfield.converter;



import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;


public class DataConverter {
	static long acc = 0;
	
	public HashMap<String, String> hexToDatas(List<String> list) {

		final long UA_DATETIME_UNIX_EPOCH = 11644473600L;
		
		List<String> timeStampList = new ArrayList<>();
		List<String> valueList = new ArrayList<String>();
		String type = "";
		String length = "";
		for(int i=0;i<list.size();i++) {
			if(i<8) {
				timeStampList.add(list.get(i));
			}else if (i==8) {
				type = list.get(i);
			}else if (i==12) {
				length = list.get(i);
			}else if (i>=16) {
				valueList.add(list.get(i));
			}else {
				continue;
			}
		}
		Collections.reverse(timeStampList);
		
		String timeStampStr = "";
		for(int j=0;j<timeStampList.size();j++) {
			timeStampStr += timeStampList.get(j);
		}
		
		String valueStr = "";
		for(int j=0;j<valueList.size();j++) {
			valueStr += valueList.get(j);
		}
		
		BigInteger timeStampData = new BigInteger(timeStampStr,16);
		

		long t = Long.parseLong(timeStampData.toString());
		
		
		short milliSec = (short)((t % 10000000) / 10000);
		long time = 0L;
		
		String zeroFiller = "";
		
		if (Short.toString(milliSec).length() < 3) {
			int rest = 3 - Short.toString(milliSec).length();
			
			for (int i = 0; i<rest; i++) {
				zeroFiller += "0";
			}
		}

		String sec = timeStampData.toString().substring(0,11);
		
		long timeStampLong = (Long.parseLong(sec)-UA_DATETIME_UNIX_EPOCH)*1000;
		String resultTimeStamp = Long.toString(timeStampLong).substring(0,10) + (zeroFiller + Short.toString(milliSec));
		
		
//		if (acc++ % 100 == 0) {
//		System.out.println(timeStampLong);
//		System.out.println(new Date(timeStampLong));
//		}
		Date now = new Date();
		//System.out.println(timeStampLong);
//		System.out.println("들어온시간==>"+new Date(timeStampLong));
//		System.out.println("컨버팅시간==>"+now);
//		System.out.println("***delay==>"+(now.getTime()-timeStampLong)+"****");
		
		String typeValue = null;
		BigInteger bigInt = null;
		
		switch (type) {
		case "01":
			type = "TYPES_BOOLEAN";
			typeValue = new BigInteger(valueStr,16).toString();
			//System.out.println("boolean==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "02":
			type = "TYPES_SBYTE";
			typeValue = new BigInteger(valueStr,16).toString();
			//System.out.println("SBYTE==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "03":
			//unsigned short?
			type = "TYPES_BYTE";
			bigInt = new BigInteger(valueStr, 16);
//			byte uByte = bigInt.byteValue();
//			System.out.println(Byte.toUnsignedInt(uByte));
//			System.out.println("uByte==>"+uByte);
			typeValue =  new BigInteger(valueStr,16).toString();
			//System.out.println("BYTE==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "04":
			type = "TYPES_INT16";
			bigInt = new BigInteger(valueStr,16);
			typeValue = bigInt.toString();
			//System.out.println("INT16==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "05":
			type = "TYPES_UINT16";
			bigInt = new BigInteger(valueStr,16);
			int uInt16 = bigInt.intValue();
			typeValue = Integer.toUnsignedString(uInt16);
			//System.out.println("UINT16==>" + typeValue + "/ dataValue==>"+valueStr);

			break;
		case "06":
			type = "TYPES_INT32";
			bigInt = new BigInteger(valueStr,16);
			typeValue = bigInt.toString();
			//System.out.println("INT32==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "07":
			type = "TYPES_UINT32";
			bigInt = new BigInteger(valueStr,16);
			int uInt32 = bigInt.intValue();
			typeValue = Integer.toUnsignedString(uInt32);
			//System.out.println("UINT32==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "08":
			type = "TYPES_INT64";
			bigInt = new BigInteger(valueStr,16);
			typeValue = bigInt.toString();
			//System.out.println("INT64==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "09":
			type = "TYPES_UINT64";
			bigInt = new BigInteger(valueStr,16);
			int uInt64 = bigInt.intValue();
			typeValue = Integer.toUnsignedString(uInt64);
			//System.out.println("UINT64==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "0a":
			type = "TYPES_FLOAT";
			Long l_float = Long.parseLong(valueStr,16);
			Float f = Float.intBitsToFloat(l_float.intValue());
			//System.out.println(f);
			typeValue = f.toString();
			//System.out.println("FLOAT==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "0b":
			type = "TYPES_DOUBLE";
			Long l_double = Long.parseLong(valueStr,16);
			Double d = Double.longBitsToDouble(l_double.longValue());
			//System.out.println(d);
			typeValue = d.toString();
			//System.out.println("DOUBLE==>" + typeValue + "/ dataValue==>"+valueStr);

			break;
		case "0c":
			type = "TYPES_STRING";
			bigInt = new BigInteger(valueStr, 16);
			typeValue = new String(bigInt.toByteArray(), StandardCharsets.UTF_8);
			//System.out.println("String==>" + typeValue + "/ dataValue==>"+valueStr);
			break;
		case "0d":
			type = "TYPES_ARRAY";
			break;
		}
		
		HashMap<String, String> result = new HashMap<>();
		result.put("timeStamp", resultTimeStamp);
		result.put("type",type);
		result.put("length", length);
		result.put("value", typeValue);
		
		return result;
	}
}
