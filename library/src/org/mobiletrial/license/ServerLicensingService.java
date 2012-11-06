package org.mobiletrial.license;

import java.net.URL;

import org.json.JSONObject;
import org.mobiletrial.license.connect.RestClient;

import android.util.Log;

public class ServerLicensingService implements ILicensingService {

	private URL webserivceUrl;
	
	public ServerLicensingService(URL websericeUrl){
		this.webserivceUrl = websericeUrl;
	}
	
	@Override
	public void checkLicense(int nonce, String packageName, String versionCode,
			String userId, ILicenseResultListener listener) {
		
		RestClient client = new RestClient(webserivceUrl);
		
		JSONObject obj = new JSONObject();
		
		client.post("/authorize/" + packageName + "/customer/" + userId , obj, new RestClient.OnRequestFinishedListener() {
			@Override
			public void gotResponse(JSONObject response) {
				response.toString();
			}
			
			@Override
			public void gotError(int errorCode) {
				Log.d("test", ""+ errorCode);
			}
		});
	}
}
