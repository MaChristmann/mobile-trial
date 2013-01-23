package org.mobiletrial.license;

import java.net.URL;
import java.net.URLEncoder;
import java.util.Date;

import org.json.JSONException;
import org.json.JSONObject;
import org.mobiletrial.license.connect.RestClient;

import android.content.Context;
import android.text.TextUtils;
import android.util.Log;

public class ServerLicensingService implements ILicensingService {
	
	private static final String TAG = "ServerLicensingService";

	private static final String PARAM_TIMESTAMP = "ts";
	private static final String PARAM_VERSIONCODE = "vc";
	private static final String PARAM_NONCE = "n";

	private static final int ERROR_SERVER_FAILURE = 0x4;
	
	private Context mContext;
	private URL mWebserviceUrl;

	
	public ServerLicensingService(Context context, URL websericeUrl){
		this.mContext = context;
		this.mWebserviceUrl = websericeUrl;
	}
	
	@Override
	public void checkLicense(int nonce, String packageName, String versionCode,
			String userId, final ILicenseResultListener listener){
		
		RestClient client = new RestClient(mContext, mWebserviceUrl);
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
			public void gotResponse(String response) {
				try {
					if(response == null){
						// Incorrect response
						listener.verifyLicense(ERROR_SERVER_FAILURE, null, null);
						return;
					}
					
					response = response.replace("\"", "");
					String data[] = TextUtils.split(response, "--");
					if(data.length != 3){
						// Incorrect response
						listener.verifyLicense(ERROR_SERVER_FAILURE, null, null);
						return;
					}

					int responseCode = Integer.parseInt(data[0]);
					String signedData = data[1];
					String signature = data[2];
       
			        listener.verifyLicense(responseCode, signedData, signature);
				} catch (NumberFormatException e){
					// Incorrect response
					listener.verifyLicense(ERROR_SERVER_FAILURE, null, null);
				} catch (Exception e){
					// Unknown error
					e.printStackTrace();
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
