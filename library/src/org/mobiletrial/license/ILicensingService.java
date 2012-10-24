package org.mobiletrial.license;

public interface ILicensingService {
	 void checkLicense(int none, String packageName, ILicenseResultListener listener); 
}
