package org.mobiletrial.license;

import java.util.HashSet;
import java.util.Set;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.accounts.AuthenticatorDescription;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.pm.PackageManager;
import android.graphics.drawable.Drawable;

 abstract class IdentityResolver {
	private static final String PREFS_FILE = "org.mobiletrial.license.LicenseChecker";
	private static final String PPEF_USERID = "userId";
	private final Context mContext;
	private final LicenseCheckerCallback mCallback;
    private SharedPreferences mPreferences;
        
    private ChooseAccountDialog mChooseAccountDialog = null;
    
	public IdentityResolver(Context context, LicenseCheckerCallback callback){
		mContext = context;
		mCallback = callback;
	    SharedPreferences sp = mContext.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE);
	    mPreferences = sp;
	}
	
	private String getUserId(){
      return mPreferences.getString(PPEF_USERID, null);
	}
	
	private void setUserId(String userId){
		Editor edit = mPreferences.edit();
		edit.putString(PPEF_USERID, userId);
		edit.commit();
	}
	
	public void getIdentity(IAccountType accountType){
		AccountManager manager = (AccountManager) mContext.getSystemService(Context.ACCOUNT_SERVICE);
		Account[] accountList = manager.getAccounts();
		Set<String> possibleAccount = new HashSet<String>();

		Drawable accountIcon = getIconForAccountType(accountType.getType(), manager);
		
		for(Account account: accountList)
		{
			if(account.type.equalsIgnoreCase(accountType.getType()))
			{
				possibleAccount.add(account.name);
			}
		}
		
		int countAccounts = possibleAccount.size();
		if(countAccounts == 1){
			String userId = obfuscatedIdentifier((String)possibleAccount.toArray()[0]);
			setUserId(userId);
			onIdentifactionFinished(userId);
		} else if(countAccounts <= 0){
			//No Account with the given account type available
			//Return an application Error
			 mCallback.applicationError(LicenseCheckerCallback.ERROR_NO_ACCOUNT_AVAILABLE);
		} else {
			String preferredUserId = getUserId();
			
			if(preferredUserId != null){
				if(possibleAccount.contains(preferredUserId)){
					String userId = obfuscatedIdentifier(preferredUserId);
					setUserId(userId);
					onIdentifactionFinished(userId);
					return;
				}
			}
			
			//Start choose-Dialog and let the user decide
			final String[] sequence = possibleAccount.toArray(new String[countAccounts]);
			
			if(mChooseAccountDialog == null)
				mChooseAccountDialog = new ChooseAccountDialog(mContext);
			
			mChooseAccountDialog
				.initAccountIcon(accountIcon)
				.initAccountList(sequence, new Dialog.OnClickListener(){
					@Override
					public void onClick(DialogInterface dialog, int which) {
						String userId = obfuscatedIdentifier(sequence[which]);
						setUserId(userId);
						onIdentifactionFinished(userId);
					}
				});
			mChooseAccountDialog.show();
		}
	}

	  private Drawable getIconForAccountType(String accountType, AccountManager manager) {
	        AuthenticatorDescription[] descriptions =  manager.getAuthenticatorTypes();
	        for (AuthenticatorDescription description: descriptions) {
	            if (description.type.equals(accountType)) {
	                PackageManager pm = mContext.getPackageManager();
	                return pm.getDrawable(description.packageName, description.iconId, null); 
	            }
	        }
	        return null;
	   }
		
	private String obfuscatedIdentifier(String identifier){
		return identifier;
	}

	public abstract void onIdentifactionFinished(String userId);

	public void setChooseAccountDialog(ChooseAccountDialog dlg) {
		mChooseAccountDialog = dlg;
	}
}