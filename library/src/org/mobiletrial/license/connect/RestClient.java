package org.mobiletrial.license.connect;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.protocol.HTTP;
import org.json.JSONException;
import org.json.JSONObject;

import android.os.Looper;
import android.util.Log;
 
public class RestClient {
	
	private static final int ERROR_CONTACTING_SERVER = 0x101;
	private static final int ERROR_SERVER_FAILURE = 0x4;
	
	private String TAG = "RestClient";
	
	private URL mServiceUrl;
	
	public RestClient(URL serviceUrl){
		mServiceUrl = serviceUrl;
	}
	
	public void post(final String path, final JSONObject requestJson, final OnRequestFinishedListener listener) {
        Thread t = new Thread(){
        public void run() {
                Looper.prepare(); //For Preparing Message Pool for the child Thread
                HttpClient client = new DefaultHttpClient();
                HttpConnectionParams.setConnectionTimeout(client.getParams(), 10000); //Timeout Limit
                HttpResponse response;
                try{
                	String urlStr = mServiceUrl.toExternalForm();
                	if(urlStr.charAt(urlStr.length()-1) != '/')
                		urlStr += "/";
                	urlStr += path;
                	URI actionURI = new URI(urlStr);
                	
                    HttpPost post = new HttpPost(actionURI);
                    StringEntity se = new StringEntity( requestJson.toString());  
                    se.setContentType(new BasicHeader(HTTP.CONTENT_TYPE, "application/json"));
                    post.setEntity(se);
                    response = client.execute(post);
                    
                    /* Checking response */
                    if(response==null){
                    	listener.gotError(ERROR_CONTACTING_SERVER);
                    	Log.w(TAG, "Error contacting licensing server.");
                    	return;
                    }   
        			int statusCode = response.getStatusLine().getStatusCode();
        			if (statusCode != HttpStatus.SC_OK) {
        				Log.w(TAG, "An error has occurred on the licensing server.");
        				listener.gotError(ERROR_SERVER_FAILURE);
        				return;
        			}
                    
        			/* Convert response to JSON */
                    InputStream in = response.getEntity().getContent(); //Get the data in the entity
                    String responseStr = inputstreamToString(in);
                    JSONObject responseJson = new JSONObject(responseStr);
                    listener.gotResponse(responseJson);
                    
                } catch(ClientProtocolException e){
                	Log.w(TAG, "ClientProtocolExeption:  " + e.getLocalizedMessage());
                	e.printStackTrace();
                } catch(IOException e){
                	Log.w(TAG, "Error on contacting server: " + e.getLocalizedMessage());
                	listener.gotError(ERROR_CONTACTING_SERVER);
                } catch (URISyntaxException e) {
                	//This shouldn't happen	
                	Log.w(TAG, "Could not build URI.. Your service Url is propably not a valid Url:  " + e.getLocalizedMessage());
                	e.printStackTrace();
				} catch (JSONException e) {
					Log.w(TAG, "Something went wrong by parsing response json:  " + e.getLocalizedMessage());
					listener.gotError(ERROR_SERVER_FAILURE);
				}
                Looper.loop(); //Loop in the message queue
            }
        };
        t.start();      
    }
	
	public static abstract class OnRequestFinishedListener{
		public abstract void gotResponse(JSONObject response);
		public abstract void gotError(int errorCode);
	}
	
	private String inputstreamToString(InputStream in) throws IOException{
        BufferedReader streamReader = new BufferedReader(new InputStreamReader(in, "UTF-8")); 
        StringBuilder responseStrBuilder = new StringBuilder();
        
        String inputStr;
        while ((inputStr = streamReader.readLine()) != null)
        	responseStrBuilder.append(inputStr);
        return responseStrBuilder.toString();
	}
}