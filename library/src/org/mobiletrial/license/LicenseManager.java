package org.mobiletrial.license;

import java.util.ArrayList;
import java.util.HashMap;

import org.mobiletrial.license.constraint.LicenseConstraint;
import org.mobiletrial.license.verification.LicenseVerification;

import android.util.Log;


public class LicenseManager {

	private boolean debugMode = false;
	private HashMap<LicenseConstraint.Type, LicenseConstraint> constraints;
	private HashMap<LicenseVerification.Type, LicenseVerification> verifications;
	private ArrayList<LicenseVerification.Type> order;

	/* Public for App Developer */
	public LicenseManager(){ }
	public LicenseManager(boolean debugMode){
		this.debugMode = debugMode;
		this.constraints = new HashMap<LicenseConstraint.Type, LicenseConstraint>();
		this.verifications = new HashMap<LicenseVerification.Type, LicenseVerification>();
		this.order = new ArrayList<LicenseVerification.Type>(5);
	}

	public void addConstraint(LicenseConstraint constraint){
		LicenseConstraint.Type cType = constraint.getType();
		if(debugMode){
			if(this.constraints.get(cType) != null){
				Log.d(LicenseLog.Tag, String.format(LicenseLog.MsgConstraintOverride, cType));
			}
		}
		this.constraints.put(cType, constraint);
	}

	public boolean removeConstraint(LicenseConstraint.Type constraintType){
		if(constraints.remove(constraintType) == null)
			return false;
		return true;
	}

	public void addVerification(LicenseVerification verification){
		LicenseVerification.Type vType = verification.getType(); 
		if(debugMode){
			if(this.verifications.get(vType) != null){
				Log.d(LicenseLog.Tag, String.format(LicenseLog.MsgVerificationOverride, vType));
			}
		}
		this.verifications.put(vType, verification);
	}

	public boolean removeVerification(LicenseVerification.Type verificationType){
		if(this.verifications.remove(verificationType) == null)
			return false;
		return true;
	}

	public void setVerificationOrder(LicenseVerification.Type[] verificationOrder){
		if(order.size() > 0)
			this.clearVerificationOrder();
		for(LicenseVerification.Type verificationType : verificationOrder ){
			order.add(verificationType);
		}
	}

	public void clearVerificationOrder(){
		order.clear();
	}
}
