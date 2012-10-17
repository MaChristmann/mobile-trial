package org.mobiletrial.license;

import android.content.Context;
import android.os.AsyncTask;

public class LicenseTask extends AsyncTask<LicenseManager, Void, LicenseResult> {

	private Context context;
	
	public LicenseTask(Context context){
		this.context = context;
	}
	
	@Override
	protected LicenseResult doInBackground(LicenseManager... manager) {
		// TODO Auto-generated method stub
		return null;
	}

}
