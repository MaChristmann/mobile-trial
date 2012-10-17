package org.mobiletrial.license.verification;

import org.mobiletrial.license.LicenseResult;

import android.content.Context;

public abstract class LicenseVerification {
	public enum Type {
		Server 
	} 
	protected Type type;

	public Type getType() {
		return type;
	}
	
	public abstract LicenseResult verify(Context context);
}
