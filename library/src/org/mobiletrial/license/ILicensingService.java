package org.mobiletrial.license;

public interface ILicensingService {
	void checkLicense(int nonce, String packageName, String versionCode, String userId, ILicenseResultListener listener);
}
