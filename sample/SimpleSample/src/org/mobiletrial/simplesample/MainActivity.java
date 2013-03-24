/*
 * Copyright (C) 2010 The Android Open Source Project+
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


package org.mobiletrial.simplesample;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import org.mobiletrial.license.LicenseChecker;

import org.mobiletrial.license.NotLicensedDialog;
import org.mobiletrial.license.PlaystoreAccountType;
import org.mobiletrial.license.RetryDialog;
import org.mobiletrial.license.ServerManagedPolicy;

import com.google.android.vending.licensing.AESObfuscator;
import org.mobiletrial.license.LicenseCheckerCallback;
import com.google.android.vending.licensing.Policy;

import android.app.Activity;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings.Secure;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

/**
 * Welcome to the world of Android Market licensing. We're so glad to have you
 * onboard!
 * <p>
 * The first thing you need to do is get your hands on your public key.
 * Update the BASE64_PUBLIC_KEY constant below with your encoded public key,
 * which you can find on the
 * <a href="http://market.android.com/publish/editProfile">Edit Profile</a>
 * page of the Market publisher site.
 * <p>
 * Log in with the same account on your Cupcake (1.5) or higher phone or
 * your FroYo (2.2) emulator with the Google add-ons installed. Change the
 * test response on the Edit Profile page, press Save, and see how this
 * application responds when you check your license.
 * <p>
 * After you get this sample running, peruse the
 * <a href="http://developer.android.com/guide/publishing/licensing.html">
 * licensing documentation.</a>
 */
public class MainActivity extends Activity {
	// Enter your public key here you get from the MobileTrial server
	private static final String BASE64_PUBLIC_KEY = 
		"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMMBY8FOl8y/wzA0Dos2PNDRtq5fGiSQqkYGLJow8aDUyyzQYjupgWPusFg+7kpEd3knzXPuuuK3Rq2ccGVWPPfllh8ROdKus87GhaqIbO47bhNSaXdCmS9nPYI4l1dEalT5GV3ZsIue9EWDbshFG7DfYyS7F+64Jp6akeNypAnQIDAQAB";
		
	// Generate your own 20 random bytes, and put them here.
	private static final byte[] SALT = new byte[] {
		-46, 65, 30, -128, -103, -57, 74, -64, 51, 88, -95, -45, 77, -117, -36, -113, -11, 32, -64,
		89
	};

	// Change server url to your MobileTrial server 
	private static final String MOBILETRIAL_SERVER_URL = "http://mobiletrial.jitsu.com/";
	
	private static final int BUYAPP_REQUEST = 1337;
	
	private TextView mStatusText;
	private Button mCheckLicenseButton;

	private LicenseCheckerCallback mLicenseCheckerCallback;
	private LicenseChecker mChecker;
	// A handler on the UI thread.
	private Handler mHandler;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_INDETERMINATE_PROGRESS);
		setContentView(R.layout.activity_main);

		mStatusText = (TextView) findViewById(R.id.status_text);
		mCheckLicenseButton = (Button) findViewById(R.id.check_license_button);
		mCheckLicenseButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View view) {
				doCheck();
			}
		});

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

		// Construct the LicenseChecker with a ServerManaged Policy
		mLicenseCheckerCallback = new MyLicenseCheckerCallback();

		// Construct the LicenseChecker with a policy.
		mChecker = new LicenseChecker(
				this, new ServerManagedPolicy(this,
						new AESObfuscator(SALT, getPackageName(), deviceId)),
						BASE64_PUBLIC_KEY, 
						mobileTrialServerUrl,
						new PlaystoreAccountType());

		/*
		 * 	 Set a title for the "choose your account" dialog
		 *   or change R.string.mobiletrial_chooseaccount_title in library resources  
		 */
		mChecker.setChooseAccountTitle("Choose your Google Account");
		doCheck();
	}

	private void doCheck() {
		mCheckLicenseButton.setEnabled(false);
		setProgressBarIndeterminateVisibility(true);
		mStatusText.setText(R.string.checking_license);
		mChecker.checkAccess(mLicenseCheckerCallback);
	}

	private void displayResult(final String result) {
		mHandler.post(new Runnable() {
			public void run() {
				mStatusText.setText(result);
				setProgressBarIndeterminateVisibility(false);
				mCheckLicenseButton.setEnabled(true);
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
						dlg.setNegativeButton(new OnClickListener() {
							@Override
							public void onClick(DialogInterface dialog, int which) {
								MainActivity.this.finish();
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
						mCheckLicenseButton.setEnabled(true);
					}
				});
			} else { 
				mHandler.post(new Runnable() {
					public void run() {
						setProgressBarIndeterminateVisibility(false);
						NotLicensedDialog dlg = new NotLicensedDialog(MainActivity.this);
						dlg.setNegativeButton(new OnClickListener() {			
							@Override
							public void onClick(DialogInterface dialog, int which) {
								MainActivity.this.finish();
							}
						});
						dlg.setPositiveButton(new OnClickListener(){
							@Override
							public void onClick(DialogInterface dialog,
									int which) {	
								Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(
										"http://market.android.com/details?id=" + getPackageName()));
								startActivityForResult(marketIntent, BUYAPP_REQUEST);   
							}	
						});
						dlg.show();
						mCheckLicenseButton.setEnabled(true);
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
	protected void onDestroy() {
		super.onDestroy();
		mChecker.onDestroy();
	}

}
