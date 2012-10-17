package org.mobiletrial.license.constraint;

import org.json.JSONException;
import org.json.JSONObject;

public class TimeLicenseConstraint extends LicenseConstraint {

	private int daysValid=0; 
	
	public TimeLicenseConstraint(int daysValid) {
		this.daysValid = daysValid;
	}
	
	public int getDaysValid(){
		return daysValid;
	}

	@Override
	public JSONObject getJSONObject() throws JSONException{
		JSONObject constraintObj = new JSONObject();
		
		constraintObj.put("trialtype", "time");
		constraintObj.put("value", daysValid);
		
		return constraintObj;
	}
}
