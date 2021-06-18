package com.poc.nestfield.converter;

import java.util.ArrayList;
import java.util.List;

public class Converter {

    public String byteArrayToBinaryString(byte[] b) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < b.length; ++i) {
            sb.append(byteToBinaryString(b[i]));
        }
        return sb.toString();
    }
    public String byteToBinaryString(byte n) {
        StringBuilder sb = new StringBuilder("00000000");
        for (int bit = 0; bit < 8; bit++) {
            if (((n >> bit) & 1) > 0) {
                sb.setCharAt(7 - bit, '1');
            }
        }
        return sb.toString();
    }
 
    public byte[] binaryStringToByteArray(String s) {
        int count = s.length() / 8;
        byte[] b = new byte[count];
        for (int i = 1; i < count; ++i) {
            String t = s.substring((i - 1) * 8, i * 8);
            b[i - 1] = binaryStringToByte(t);
        }
        return b;
    }
 
    public byte binaryStringToByte(String s) {
        byte ret = 0, total = 0;
        for (int i = 0; i < 8; ++i) {
            ret = (s.charAt(7 - i) == '1') ? (byte) (1 << i) : 0;
            total = (byte) (ret | total);
        }
        return total;
    }
    
    public void byte_to_ascii(byte[] b) {
    	System.out.println("[Ascii Format]");
    	for(int i=0;i<b.length;i++) {
    		System.out.print((int)b[i]+" ");
    	}
    }
    
    public List byteArrayToHex(byte[] a) {
        StringBuilder sb = new StringBuilder();
        List<String> list = new ArrayList<>();
        for(final byte b: a) {
            sb.append(String.format("%02x", b&0xff));
        	list.add(String.format("%02x", b&0xff));
        }
        //System.out.println("hex==>"+sb);
//        System.out.println(list);
        return list;
    }
    
}
