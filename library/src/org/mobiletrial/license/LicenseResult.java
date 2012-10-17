package org.mobiletrial.license;

import java.util.Date;

import org.mobiletrial.license.verification.LicenseVerification;

public class LicenseResult {
	
	public enum Type {
		Error,
		Fail,
		Success
	}
	
	private Date verifyDate;
	private Date resultDate;
	private LicenseResult.Type resultType;
	private LicenseVerification.Type verificationType;
	
	public LicenseResult(LicenseVerification.Type verificationType
						, Date verifyDate
						, Date resultDate
						, LicenseResult.Type resultType){
		this.verificationType = verificationType;
		this.verifyDate = verifyDate;
		this.resultDate = resultDate;
		this.resultType = resultType;
	}

	public Date getVerifyDate() {
		return verifyDate;
	}

	public Date getResultDate() {
		return resultDate;
	}

	public LicenseResult.Type getResultType() {
		return resultType;
	}

	public LicenseVerification.Type getVerificationType() {
		return verificationType;
	}
	
}
