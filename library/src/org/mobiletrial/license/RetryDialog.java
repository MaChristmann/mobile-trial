package org.mobiletrial.license;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.res.Resources;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.TextView;

public class RetryDialog{
	private Context mContext;

	private String mTitle;
	private String mBody;

	//Positive Button
	private DialogInterface.OnClickListener mPositiveOnClickListener;
	private String mPositiveTitle;

	//Negative Button
	private DialogInterface.OnClickListener mNegativeOnClickListener;
	private String mNegativeTitle;

	public RetryDialog(Context context){
		mContext = context;
	}

	public RetryDialog setTitle(String title){
		mTitle = title;
		return this;
	}

	public RetryDialog setBody(String body){
		mBody = body;
		return this;
	}

	public RetryDialog setPositiveButton(DialogInterface.OnClickListener onClickListener){
		Resources res = mContext.getResources();
		return setPositiveButton(res.getString(R.string.mobiletrial_retry_positivebutton), onClickListener);	
	}

	public RetryDialog setPositiveButton(String title, DialogInterface.OnClickListener onClickListener){
		mPositiveOnClickListener = onClickListener;
		mPositiveTitle = title;
		return this;
	}

	public RetryDialog setNegativeButton(DialogInterface.OnClickListener onClickListener){
		Resources res = mContext.getResources();
		return setNegativeButton(res.getString(R.string.mobiletrial_retry_negativebutton), onClickListener);
	}

	public RetryDialog setNegativeButton(String title, DialogInterface.OnClickListener onClickListener){
		mNegativeOnClickListener = onClickListener;
		mNegativeTitle = title;
		return this;
	}

	public void show(){
		AlertDialog.Builder builder = new AlertDialog.Builder(mContext);
		// Get the layout inflater
		LayoutInflater inflater = (LayoutInflater) mContext.getSystemService( Context.LAYOUT_INFLATER_SERVICE );

		// Inflate and set the layout for the dialog
		// Pass null as the parent view because its going in the dialog layout
		View dialogView = inflater.inflate(R.layout.retry_dlg, null);
		if(mBody != null){
			TextView bodyText = (TextView) dialogView.findViewById(R.id.mobiletrial_retry_body);
			bodyText.setText(mBody);
		}

		if(mPositiveOnClickListener != null){
			if(mPositiveOnClickListener == null)
				mPositiveTitle = mContext.getResources().getString(R.string.mobiletrial_retry_positivebutton);
			builder.setPositiveButton(mPositiveTitle, mPositiveOnClickListener);
			
		}
		
		if(mNegativeOnClickListener != null){
			if(mNegativeTitle == null)
				mNegativeTitle = mContext.getResources().getString(R.string.mobiletrial_retry_negativebutton);
			builder.setNegativeButton(mNegativeTitle, mNegativeOnClickListener);
		}
		
		builder.setView(dialogView);
		// Add action buttons
		
		if(mTitle != null){
			builder.setTitle(mTitle);
		} else {
			builder.setTitle(mContext.getResources().getString(R.string.mobiletrial_retry_title));
		}
		builder.setCancelable(false);
		builder.create().show();
	}
}
