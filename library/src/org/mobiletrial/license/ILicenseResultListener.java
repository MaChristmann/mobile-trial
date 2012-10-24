package org.mobiletrial.license;

public interface ILicenseResultListener {
	void verifyLicense(final int responseCode, final String signedData,
			final String signature);
}
