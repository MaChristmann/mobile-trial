package org.mobiletrial.restrictafterexpired;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import org.mobiletrial.license.LicenseChecker;
import org.mobiletrial.license.LicenseCheckerCallback;
import org.mobiletrial.license.NotLicensedDialog;
import org.mobiletrial.license.PlaystoreAccountType;
import org.mobiletrial.license.RetryDialog;
import org.mobiletrial.license.ServerManagedPolicy;
import org.mobiletrial.restrictafterexpired.R;

import com.google.android.vending.licensing.AESObfuscator;
import com.google.android.vending.licensing.Policy;

import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings.Secure;
import android.app.Activity;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.DialogInterface.OnClickListener;
import android.content.res.Resources;
import android.view.Menu;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

public class MainActivity extends Activity {
	private static final int BUYAPP_REQUEST = 1337;
	
	// Enter your public key here you get from the MobileTrial server
	private static final String BASE64_PUBLIC_KEY = 
		"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCh4x66P923b2ZsuekI+rFmIFRyNJ82w/cQwXDAEVI6zz4b+8f1pe0RXnIZS9DD8MnO9Wya3p8nSsftH4Kedvt/FkMtF+oZHBvOI1HuNSqSnFzMY/Y5OikvRYoH6ZUurvdySIMWH5BTP+TYqNbskQtID+89WkXiNy7jRpjqDZryTwIDAQAB";
		// Generate your own 20 random bytes, and put them here.
	private static final byte[] SALT = new byte[] {
		-46, 65, 30, -128, -103, -57, 74, -64, 51, 88, -95, -45, 77, -117, -36, -113, -11, 32, -64,
		89
	};
	
	// Change server url to your MobileTrial server 
	private static final String MOBILETRIAL_SERVER_URL = "http://mobiletrial.jitsu.com/";

	private TextView mStatusText;
	private LicenseCheckerCallback mLicenseCheckerCallback;
	private LicenseChecker mChecker;
	// A handler on the UI thread.
	private Handler mHandler;
	
	//Paid features
	private Button mPaidFeatureButton;
	
	private Resources mRes;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
     	requestWindowFeature(Window.FEATURE_INDETERMINATE_PROGRESS);
		setContentView(R.layout.activity_main);

		mStatusText = (TextView) findViewById(R.id.status_text);
		
		// Disable paid fearures by default and enable it if trial period is not expired!
		mPaidFeatureButton = (Button) findViewById(R.id.paid_feature_btn);
		mPaidFeatureButton.setEnabled(false);
		
		mRes = getResources();
		
		mHandler = new Handler();

		// Try to use more data here. ANDROID_ID is a single point of attack.
		String deviceId = Secure.getString(getContentResolver(), Secure.ANDROID_ID);

		//Create an url object to the MobileTrial server
		URL mobileTrialServerUrl = null;
		try {
			mobileTrialServerUrl = URI.create(MOBILETRIAL_SERVER_URL).toURL();
		} catch (MalformedURLException e) {
			//Shouldn't happen if your string is a valid url
			e.printStackTrace();
		}

		// Library calls this when license check is finished
		mLicenseCheckerCallback = new MyLicenseCheckerCallback();

		// Construct the LicenseChecker with a ServerManaged Policy
		mChecker = new LicenseChecker(
				this, new ServerManagedPolicy(this,
						new AESObfuscator(SALT, getPackageName(), deviceId)),
						BASE64_PUBLIC_KEY, 
						mobileTrialServerUrl,
						new PlaystoreAccountType());

		//Check for license
		doCheck();    
    }

	private void doCheck() {
		setProgressBarIndeterminateVisibility(true);
		mStatusText.setText(R.string.checking_license);
		mChecker.checkAccess(mLicenseCheckerCallback);
	}
	
	private void displayResult(final String result) {
		mHandler.post(new Runnable() {
			public void run() {
				mStatusText.setText(result);
				setProgressBarIndeterminateVisibility(false);
			}
		});
	}
	
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		// Repeat the licensing check.
		// If you send the user to PlayStore to buy the app 
		// or you let the user change the network connections settings
		// you should repeat the licensing check as the dialog already disappeared
		if(requestCode == BUYAPP_REQUEST){
			doCheck();
		}
	}
	
	
	private class MyLicenseCheckerCallback implements LicenseCheckerCallback {
		public void allow(int policyReason) {
			if (isFinishing()) {
				// Don't update UI if Activity is finishing.
				return;
			}
			
			mHandler.post(new Runnable() {
				public void run() {
					mPaidFeatureButton.setEnabled(true);
				}
			});
			
			// Should allow user access.
			displayResult(getString(R.string.allow));
		}

		public void dontAllow(int policyReason) {
			if (isFinishing()) {
				// Don't update UI if Activity is finishing.
				return;
			}
			displayResult(getString(R.string.dont_allow));
			// Should not allow access. In most cases, the app should assume
			// the user has access unless it encounters this. If it does,
			// the app should inform the user of their unlicensed ways
			// and then either shut down the app or limit the user to a
			// restricted set of features.
			// In this example, we show a dialog that takes the user to Market.
			// If the reason for the lack of license is that the service is
			// unavailable or there is another problem, we display a
			// retry button on the dialog and a different message.
			if(policyReason == Policy.RETRY){
				mHandler.post(new Runnable() {
					public void run() {
						setProgressBarIndeterminateVisibility(false);
						RetryDialog dlg = new RetryDialog(MainActivity.this);
						dlg.setNegativeButton(mRes.getString(R.string.use_free_features), new OnClickListener() {
							@Override
							public void onClick(DialogInterface dialog, int which) {
								mPaidFeatureButton.setEnabled(false);
							}
						});
						dlg.setPositiveButton(new OnClickListener(){
							@Override
							public void onClick(DialogInterface dialog,
									int which) {	
								doCheck();
							}	
						});
						dlg.show();
					}
				});
			} else { 
				mHandler.post(new Runnable() {
					public void run() {
						setProgressBarIndeterminateVisibility(false);
						NotLicensedDialog dlg = new NotLicensedDialog(MainActivity.this);
						dlg.setNegativeButton(mRes.getString(R.string.use_free_features), new OnClickListener() {			
							@Override
							public void onClick(DialogInterface dialog, int which) {
								mPaidFeatureButton.setEnabled(false);
							}
						});
						dlg.setPositiveButton(new OnClickListener(){
							@Override
							public void onClick(DialogInterface dialog,
									int which) {	
								
								//Add your package name of the paid app
								Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(
										"http://market.android.com/details?id=" + "my.app.package.name"));
								startActivityForResult(marketIntent, BUYAPP_REQUEST);   
							}	
						});
						dlg.show();
					}
				});	
			}
		}

		public void applicationError(int errorCode) {
			if (isFinishing()) {
				// Don't update UI if Activity is finishing.
				return;
			}
			// This is a polite way of saying the developer made a mistake
			// while setting up or calling the license checker library.
			// Please examine the error code and fix the error.
			String result = String.format(getString(R.string.application_error), errorCode);
			displayResult(result);
		}
	}

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_main, menu);
        return true;
    }
}
