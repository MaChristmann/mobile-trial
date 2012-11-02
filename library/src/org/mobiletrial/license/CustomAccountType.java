package org.mobiletrial.license;

public class CustomAccountType implements IAccountType{
	private String type;
	
	public CustomAccountType(String type){
		this.type = type;
	}
	
	public String getType(){
		return this.type;
	}
}
