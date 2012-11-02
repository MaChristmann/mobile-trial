package org.mobiletrial.license;

public class PlaystoreAccountType implements IAccountType {	
	private final String playstoreType = "com.google";
		
	@Override
	public String getType() {
		return playstoreType;
	}
}
