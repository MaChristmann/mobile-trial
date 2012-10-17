package org.mobiletrial.license.constraint;

import org.json.JSONException;
import org.json.JSONObject;

public abstract class LicenseConstraint {
	public enum Type{ 
		Time
	}
	
	protected Type type;

	public Type getType() {
		return type;
	}
	
	public abstract JSONObject getJSONObject() throws JSONException;
}
