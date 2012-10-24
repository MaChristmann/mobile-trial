package org.mobiletrial.license;

public class MockUpLicenseService implements ILicensingService {

	@Override
	public void checkLicense(int nonce, String packageName,
			ILicenseResultListener listener) {
		
		//Validity Timestamp
		long validts = System.currentTimeMillis() + 60000;
		long gracets = validts + 60000;
		int retrys = 0;
		int responseCode = 0;
        String sampleResponse =  responseCode +  "|" +nonce+  "|" + packageName + "|1|" +
        "ADf8I4ajjgc1P5ZI1S1DN/YIPIUNPECLrg==|1279578835423:VT="+ validts + "&GT=" + gracets + "&GR=" + retrys;
        
        for(int i=0; i < 1000000; i++){
        	double a = i / 1.01d;
        }
		listener.verifyLicense(responseCode, sampleResponse, "");
	}

}
