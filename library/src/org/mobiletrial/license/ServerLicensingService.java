package org.mobiletrial.license;

import java.net.URL;
import java.net.URLEncoder;
import java.util.Date;

import org.json.JSONException;
import org.json.JSONObject;
import org.mobiletrial.license.connect.RestClient;

import android.text.TextUtils;
import android.util.Log;

public class ServerLicensingService implements ILicensingService {
	
	private static final String TAG = "ServerLicensingService";

	private static final String PARAM_RESPONECODE = "rc";
	private static final String PARAM_TIMESTAMP = "ts";
	private static final String PARAM_VERSIONCODE = "vc";
	private static final String PARAM_NONCE = "n";
	private static final String PARAM_PACKAGENAME = "pn";
	private static final String PARAM_USERID = "ui";
	
	private static final String EXTRA_VALIDTIME = "VT";
	private static final String EXTRA_GRACERETRYS = "GR";
	private static final String EXTRA_GRACETIME = "GT";
	
	private static final int ERROR_SERVER_FAILURE = 0x4;
	
	private URL webserivceUrl;
	
	public ServerLicensingService(URL websericeUrl){
		this.webserivceUrl = websericeUrl;
	}
	
	@Override
	public void checkLicense(int nonce, String packageName, String versionCode,
			String userId, final ILicenseResultListener listener){
		
		RestClient client = new RestClient(webserivceUrl);
		JSONObject body = new JSONObject();
		try {
			long timestamp = new Date().getTime();
			body.put(PARAM_NONCE, nonce);
			body.put(PARAM_VERSIONCODE, versionCode);
			body.put(PARAM_TIMESTAMP, timestamp);
		} catch (JSONException e) {
			Log.w(TAG, "Error on creating server response");
			listener.verifyLicense(ERROR_SERVER_FAILURE, null, null);
		}
		
		String path = "/authorize/" + URLEncoder.encode(packageName) + "/customer/" + URLEncoder.encode(userId);
		
		client.post(path, body, new RestClient.OnRequestFinishedListener() {
			@Override
			public void gotResponse(JSONObject response) {
				try {
					//Essential Parameters
					int responseCode = response.getInt(PARAM_RESPONECODE);
					int responseNonce = response.getInt(PARAM_NONCE);
					String responsePackageName = response.getString(PARAM_PACKAGENAME) ;
					String responseUserId = response.getString(PARAM_USERID);
					String responseVersionCode = response.getString(PARAM_VERSIONCODE);
					long responseTimestamp = response.getLong(PARAM_TIMESTAMP);
					//Extras
					String extraGraceRetrys = EXTRA_GRACERETRYS + "=" +response.getString(EXTRA_GRACERETRYS);
					String extraGraceTime = EXTRA_GRACETIME + "=" + response.getString(EXTRA_GRACETIME);
					String extraValidTime = EXTRA_VALIDTIME + "=" + response.getString(EXTRA_VALIDTIME);
					
			        //final String sampleResponse =  responseCode +  "|" +nonce+  "|" + packageName + "|" + rVersionCode + "|" +
			        //"ADf8I4ajjgc1P5ZI1S1DN/YIPIUNPECLrg==|1279578835423:VT="+ validts + "&GT=" + gracets + "&GR=" + retrys;
			   
					String responseString;
					
			        responseString = TextUtils.join("|", new Object [] { responseCode, responseNonce, responsePackageName, responseVersionCode,
			        		responseUserId, responseTimestamp });
			        responseString += ":" + extraValidTime+"&"+extraGraceTime+"&"+extraGraceRetrys;
			         
			        listener.verifyLicense(responseCode, responseString, "");
					
				} catch (JSONException e) {
					//Error json valid but missing keys
					Log.w(TAG, "Missing parameter in server response");
					listener.verifyLicense(ERROR_SERVER_FAILURE, null, null);
				}

			}
			
			@Override
			public void gotError(int errorCode) {
				// Error on contacting server .. no connection or server error (404, 500) 
				listener.verifyLicense(ERROR_SERVER_FAILURE, null, null);
			}
		});
	}
}
