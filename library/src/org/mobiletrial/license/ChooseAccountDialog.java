package org.mobiletrial.license;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.res.Resources;
import android.graphics.drawable.Drawable;

public class ChooseAccountDialog{
	private AlertDialog.Builder mDialogBuilder;

	ChooseAccountDialog(Context context){
		this(context, null);
	}
	
	ChooseAccountDialog(Context context, String title) {	
		mDialogBuilder = new AlertDialog.Builder(context);
		mDialogBuilder.setCancelable(false);
		
		if(title == null){
			Resources res = context.getResources();
			title = res.getString(R.string.mobiletrial_chooseaccount_title);
		}
		mDialogBuilder.setTitle(title);
	}
	

	ChooseAccountDialog initAccountIcon(Drawable icon){
		mDialogBuilder.setIcon(icon);
		return this;
	}
	
	ChooseAccountDialog initAccountList(CharSequence[] items, DialogInterface.OnClickListener listener){
		mDialogBuilder.setItems(items, listener);
		return this;
	}

	ChooseAccountDialog setTitle(CharSequence title){
		mDialogBuilder.setTitle(title);
		return this;
	}
	
	void show(){
		AlertDialog dlg = mDialogBuilder.create();
		dlg.show();
	}
}
