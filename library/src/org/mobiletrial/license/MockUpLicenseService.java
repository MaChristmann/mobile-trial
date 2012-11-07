package org.mobiletrial.license;

import java.net.URL;

public class MockUpLicenseService implements ILicensingService {

	private URL webserivceUrl;
	
	public MockUpLicenseService(URL websericeUrl){
		this.webserivceUrl = websericeUrl;
	}
	
	@Override
	public void checkLicense(int nonce, String packageName, String versionCode, String userId, final ILicenseResultListener listener) {
		
		//Validity Timestamp
		long validts = System.currentTimeMillis() + 60000;
		long gracets = validts + 60000;
		int retrys = 0;
		String rVersionCode = versionCode;
		final int responseCode = 1;
        final String sampleResponse =  responseCode +  "|" +nonce+  "|" + packageName + "|" + rVersionCode + "|" +
        "ADf8I4ajjgc1P5ZI1S1DN/YIPIUNPECLrg==|" +System.currentTimeMillis()+ ":VT="+ validts + "&GT=" + gracets + "&GR=" + retrys;
        
        for(int i=0; i < 1000000; i++){
        	double a = i / 1.01d;
        }
        
        new Thread(){
        	public void run() {
        		listener.verifyLicense(responseCode, sampleResponse, "");
  
        	};
        }.start();
		
	}

}
