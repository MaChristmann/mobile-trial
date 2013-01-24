/*
 * Copyright (C) 2010 The Android Open Source Project
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

package org.mobiletrial.license;

import java.net.URL;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

import android.content.Context;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Handler;
import android.os.HandlerThread;
import android.provider.Settings.Secure;
import android.util.Log;

import com.google.android.vending.licensing.NullDeviceLimiter;
import com.google.android.vending.licensing.Policy;
import com.google.android.vending.licensing.util.Base64;
import com.google.android.vending.licensing.util.Base64DecoderException;


/**
 * Client library for Android Market license verifications.
 * <p>
 * The LicenseChecker is configured via a {@link Policy} which contains the
 * logic to determine whether a user should have access to the application. For
 * example, the Policy can define a threshold for allowable number of server or
 * client failures before the library reports the user as not having access.
 * <p>
 * Must also provide the Base64-encoded RSA public key associated with your
 * developer account. The public key is obtainable from the publisher site.
 */
public class LicenseChecker {
	private static final String TAG = "LicenseChecker";
	
	private static final String KEY_FACTORY_ALGORITHM = "RSA";

	// Timeout value (in milliseconds) for calls to service.
	private static final int TIMEOUT_MS = 100 * 1000;

	private static final SecureRandom RANDOM = new SecureRandom();
	private static final boolean DEBUG_LICENSE_ERROR = false;

	private ILicensingService mService;
	private Context mContext;
	private PublicKey mPublicKey;
	private final Policy mPolicy;
	
	/**
	 * A handler for running tasks on a background thread. We don't want license
	 * processing to block the UI thread.
	 */
	private Handler mHandler;
	private final String mPackageName;
	private final String mVersionCode;
	private final Set<LicenseValidator> mChecksInProgress = new HashSet<LicenseValidator>();
	private final Queue<LicenseValidator> mPendingChecks = new LinkedList<LicenseValidator>();

	/** 
	 * Type of Account
	 */
	private IAccountType mAccountType;
	/**
	 * Obfuscated UserId
	 */
	private String mUserId;
	/** 
	 * Service Url
	 */
	private URL mServiceUrl;	
	
	/**
	 *  Custom Views 
	 */
	private ChooseAccountDialog chooseAccountDlg = null;
	
	
	/**
	 * @param context a Context
	 * @param policy implementation of Policy
	 * @param encodedPublicKey Base64-encoded RSA public key
	 * @param serviceUrl a URL to the licensing server
	 * @param accountType a instance of IAccountType to determine Android Account
	 * @throws IllegalArgumentException if encodedPublicKey is invalid
	 */
	public LicenseChecker(Context context,
							Policy policy,
							String encodedPublicKey,
							URL serviceUrl,
							IAccountType accountType) {
		mPolicy = policy;
		mPublicKey = null;
		mPublicKey = generatePublicKey(encodedPublicKey);
		mContext = context;
		mPackageName = mContext.getPackageName();
		mVersionCode = getVersionCode(context, mPackageName);
		HandlerThread handlerThread = new HandlerThread("background thread");
		handlerThread.start();
		mHandler = new Handler(handlerThread.getLooper());
		
		mAccountType = accountType;
		mServiceUrl = serviceUrl;
	}

	/**
	 * Generates a PublicKey instance from a string containing the
	 * Base64-encoded public key.
	 * 
	 * @param encodedPublicKey Base64-encoded public key
	 * @throws IllegalArgumentException if encodedPublicKey is invalid
	 */
	private static PublicKey generatePublicKey(String encodedPublicKey) {
		try {
			byte[] decodedKey = Base64.decode(encodedPublicKey);
			KeyFactory keyFactory = KeyFactory.getInstance(KEY_FACTORY_ALGORITHM);
			X509EncodedKeySpec spec = new X509EncodedKeySpec(decodedKey);
			return keyFactory.generatePublic(spec);
		} catch (NoSuchAlgorithmException e) {
			// This won't happen in an Android-compatible environment.
			throw new RuntimeException(e);
		} catch (Base64DecoderException e) {
			Log.e(TAG, "Could not decode from Base64.");
			throw new IllegalArgumentException(e);
		} catch (InvalidKeySpecException e) {
			Log.e(TAG, "Invalid key specification.");
			throw new IllegalArgumentException(e);
		}
	}
	
	/**
	 * Checks if the user should have access to the app.  Binds the service if necessary.
	 * <p>
	 * NOTE: This call uses a trivially obfuscated string (base64-encoded).  For best security,
	 * we recommend obfuscating the string that is passed into bindService using another method
	 * of your own devising.
	 * <p>
	 * source string: "com.android.vending.licensing.ILicensingService"
	 * <p>
	 * @param callback
	 */
	public synchronized void checkAccess(final LicenseCheckerCallback callback) {
		// If we have a valid recent LICENSED response, we can skip asking
		// Market.
		if (mPolicy.allowAccess()) {
			Log.i(TAG, "Using cached license response");
			callback.allow(Policy.LICENSED);
		} else {
			
			LicenseValidator validator = new LicenseValidator(mPolicy, new NullDeviceLimiter(),
					callback, generateNonce(), mPackageName, mVersionCode);
			
			if (mService == null) {
				Log.i(TAG, "Creating licensing service.");
				mService = new ServerLicensingService(mContext, mServiceUrl);
			} 
			mPendingChecks.offer(validator);
			
			//Get unique UserID
			IdentityResolver identityResolver = new IdentityResolver(mContext, callback) {
				@Override
				public void onIdentifactionFinished(String userId) {
					mUserId = userId;
					Log.d(TAG, ""+mUserId);
					runChecks();
				}
			};	
			identityResolver.setChooseAccountDialog(chooseAccountDlg);
			identityResolver.getIdentity(mAccountType);
		}
	}

	private void runChecks() {
		LicenseValidator validator;
		while ((validator = mPendingChecks.poll()) != null) {
			try {
				Log.i(TAG, "Calling checkLicense on service for " + validator.getPackageName());
				mChecksInProgress.add(validator);
				mService.checkLicense(
						validator.getNonce(), validator.getPackageName(),
						getVersionCode(mContext, mPackageName),mUserId,
						new ResultListener(validator));
			} catch (Exception e) {
				Log.w(TAG, "RemoteException in checkLicense call.", e);
				handleServiceConnectionError(validator);
			}
		}
	}

	private synchronized void finishCheck(LicenseValidator validator) {
		mChecksInProgress.remove(validator);
		if (mChecksInProgress.isEmpty()) {
			cleanupService();
		}
	}



	private class ResultListener implements ILicenseResultListener {
		private final LicenseValidator mValidator;
		private Runnable mOnTimeout;

		public ResultListener(LicenseValidator validator) {
			mValidator = validator;
			mOnTimeout = new Runnable() {
				public void run() {
					Log.i(TAG, "Check timed out.");
					handleServiceConnectionError(mValidator);
					finishCheck(mValidator);
				}
			};
			startTimeout();
		}

		private static final int ERROR_CONTACTING_SERVER = 0x101;
		private static final int ERROR_INVALID_PACKAGE_NAME = 0x102;
		private static final int ERROR_NON_MATCHING_UID = 0x103;

		// Runs in IPC thread pool. Post it to the Handler, so we can guarantee
		// either this or the timeout runs.
		public void verifyLicense(final int responseCode, final String signedData,
				final String signature) {
			mHandler.post(new Runnable() {
				public void run() {
					Log.i(TAG, "Received response.");
					// Make sure it hasn't already timed out.
					if (mChecksInProgress.contains(mValidator)) {
						clearTimeout();
						mValidator.verify(mPublicKey, responseCode, signedData, signature);
						finishCheck(mValidator);
					}
					if (DEBUG_LICENSE_ERROR) {
						boolean logResponse;
						String stringError = null;
						switch (responseCode) {
						case ERROR_CONTACTING_SERVER:
							logResponse = true;
							stringError = "ERROR_CONTACTING_SERVER";
							break;
						case ERROR_INVALID_PACKAGE_NAME:
							logResponse = true;
							stringError = "ERROR_INVALID_PACKAGE_NAME";
							break;
						case ERROR_NON_MATCHING_UID:
							logResponse = true;
							stringError = "ERROR_NON_MATCHING_UID";
							break;
						default:
							logResponse = false;
						}

						if (logResponse) {
							String android_id = Secure.getString(mContext.getContentResolver(),
									Secure.ANDROID_ID);
							Date date = new Date();
							Log.d(TAG, "Server Failure: " + stringError);
							Log.d(TAG, "Android ID: " + android_id);
							Log.d(TAG, "Time: " + date.toGMTString());
						}
					}

				}
			});
		}

		private void startTimeout() {
			Log.i(TAG, "Start monitoring timeout.");
			mHandler.postDelayed(mOnTimeout, TIMEOUT_MS);
		}

		private void clearTimeout() {
			Log.i(TAG, "Clearing timeout.");
			mHandler.removeCallbacks(mOnTimeout);
		}
	}

	/**
	 * Generates policy response for service connection errors, as a result of
	 * disconnections or timeouts.
	 */
	private synchronized void handleServiceConnectionError(LicenseValidator validator) {
		mPolicy.processServerResponse(Policy.RETRY, null);

		if (mPolicy.allowAccess()) {
			validator.getCallback().allow(Policy.RETRY);
		} else {
			validator.getCallback().dontAllow(Policy.RETRY);
		}
	}

	/**  removes reference to it. */
	private void cleanupService() {
		mService = null;
	}

	/**
	 * Inform the library that the context is about to be destroyed, so that any
	 * open connections can be cleaned up.
	 * <p>
	 * Failure to call this method can result in a crash under certain
	 * circumstances, such as during screen rotation if an Activity requests the
	 * license check or when the user exits the application.
	 */
	public synchronized void onDestroy() {
		mHandler.getLooper().quit();
	}

	/** Generates a nonce (number used once). */
	private int generateNonce() {
		return RANDOM.nextInt();
	}

	/**
	 * Get version code for the application package name.
	 * 
	 * @param context
	 * @param packageName application package name
	 * @return the version code or empty string if package not found
	 */
	private static String getVersionCode(Context context, String packageName) {
		try {
			return String.valueOf(context.getPackageManager().getPackageInfo(packageName, 0).
					versionCode);
		} catch (NameNotFoundException e) {
			Log.e(TAG, "Package not found. could not get version code.");
			return "";
		}
	}
	
	/**
	 * Setter for title of ChooseAccount Dialog
	 * @param dlg the ChooseAccountDialog
	 */
	public void setChooseAccountTitle (String title){
		chooseAccountDlg = new ChooseAccountDialog(mContext, title);
	}
	
}
