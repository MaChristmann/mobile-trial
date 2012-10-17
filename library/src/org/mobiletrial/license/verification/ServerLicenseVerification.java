package org.mobiletrial.license.verification;

import java.net.URL;

import org.mobiletrial.license.LicenseResult;

import android.content.Context;


public class ServerLicenseVerification extends LicenseVerification {
	private URL serverUrl;
	public ServerLicenseVerification(URL serverUrl){
		type = LicenseVerification.Type.Server;
		
		this.serverUrl = serverUrl;
	}
	
	public LicenseResult verify(Context context){
		LicenseResult result = null;
		
		
		
		return result;
	}
}
