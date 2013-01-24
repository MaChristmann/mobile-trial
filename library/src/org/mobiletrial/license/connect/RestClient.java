package org.mobiletrial.license.connect;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.security.KeyStore;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.message.BasicHeader;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HTTP;
import org.json.JSONObject;
import org.mobiletrial.license.R;

import android.content.Context;
import android.os.Looper;
import android.util.Log;
 
public class RestClient {
	
	private static final int ERROR_CONTACTING_SERVER = 0x101;
	private static final int ERROR_SERVER_FAILURE = 0x4;
	
	private String TAG = "RestClient";
	
	private URL mServiceUrl;
	private Context mContext;
	
	public RestClient(Context context, URL serviceUrl){
		mContext = context;
		mServiceUrl = serviceUrl;
	}
	
	public void post(final String path, final JSONObject requestJson, final OnRequestFinishedListener listener) {
        Thread t = new Thread(){
        public void run() {
                Looper.prepare(); //For Preparing Message Pool for the child Thread
           
                // Register Schemes for http and https
                final SchemeRegistry schemeRegistry = new SchemeRegistry();
                schemeRegistry.register(new Scheme("http", PlainSocketFactory.getSocketFactory(), 80));
                schemeRegistry.register(new Scheme("https", createAdditionalCertsSSLSocketFactory(), 443));

                final HttpParams params = new BasicHttpParams();         
                final ThreadSafeClientConnManager cm = new ThreadSafeClientConnManager(params,schemeRegistry);
                HttpClient client = new DefaultHttpClient(cm, params);
                
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
                    listener.gotResponse(responseStr);
                    
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
				}
                Looper.loop(); //Loop in the message queue
            }
        };
        t.start();      
    }
	
	
	protected SSLSocketFactory createAdditionalCertsSSLSocketFactory() {
	    try {
	        final KeyStore ks = KeyStore.getInstance("BKS");

	        // Load the BKS keystore file
	        final InputStream in = mContext.getResources().openRawResource( R.raw.mystore);  
	        try {
	            // Password which you use at creating the keystore
	            ks.load(in, mContext.getString( R.string.mobiletrial_keystore_passwd ).toCharArray());
	        } finally {
	            in.close();
	        }
	        return new AdditionalKeyStoresSSLSocketFactory(ks);

	    } catch( Exception e ) {
	    	//If this error happens, perhaps you are using an incompatible version of bouncycastle
	    	//Tested Versions are: bcprov-jdk16-146.jar  (Works with Android 4.1, Android 4.0.3) 
        	Log.w(TAG, "Couldn't load additional keystore: " + e.getLocalizedMessage());
        	throw new RuntimeException();
	    }
	}
	
	public static abstract class OnRequestFinishedListener{
		public abstract void gotResponse(String response);
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