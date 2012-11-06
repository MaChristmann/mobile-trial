package org.mobiletrial.license;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.res.Resources;
import android.graphics.drawable.Drawable;

public class ChooseAccountDialog{
	private AlertDialog.Builder mDialogBuilder;
	private Context mContext;
	private Resources mResources;

	public ChooseAccountDialog(Context context, String title) {
		mContext = context;
		mResources = mContext.getResources();
		
		mDialogBuilder = new AlertDialog.Builder(context);
		mDialogBuilder.setCancelable(false);
		
		if(title == null)
			title = mResources.getString(R.string.mobiletrial_chooseaccount_title);
		mDialogBuilder.setTitle(title);
	}
	
	public ChooseAccountDialog(Context context){
		this(context, null);
	}
	
	ChooseAccountDialog initAccountIcon(Drawable icon){
		mDialogBuilder.setIcon(icon);
		return this;
	}
	
	ChooseAccountDialog initAccountList(CharSequence[] items, DialogInterface.OnClickListener listener){
		mDialogBuilder.setItems(items, listener);
		return this;
	}

	public ChooseAccountDialog setTitle(CharSequence title){
		mDialogBuilder.setTitle(title);
		return this;
	}
	
	void show(){
		AlertDialog dlg = mDialogBuilder.create();
		dlg.show();
	}
}
