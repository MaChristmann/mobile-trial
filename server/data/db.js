var mongoose = require('mongoose')
, Schema =  mongoose.Schema
, ObjectId = Schema.Types.ObjectId;

var LicenseSchema = new Schema({
	trialtype: {type:String, enum: ['time']}
	, value: Number
});

var AppSchema = new Schema({
	identifier: 					{type: String, index: true, unique: true}
	, enabled: {type: Boolean, default: true}
	, maxVersionCode: 		{type: Number, default: 0}
	, updateVersionCode: 	{type: Number, default: 0}
	, graceInterval: 			{type: Number, default: 0}
	, graceRetrys: 				{type: Number, default: 3}
	, validTime: 					{type: Number, default: 0}
	, licenses: 					[LicenseSchema]
	, publicKey: 					{type: String}
	, privateKey: 				{type: String}
});

var CustomerSchema = new Schema({
	account: {type:String, index:true, unique: true}
	, createdAt : Date
	, modifiedAt : Date
	, app: {type:ObjectId, ref:'AppSchema'}
	, versionCode : {type: Number}
 });

var UserSchema = new Schema ({
	account: {type:String, index:true, unique:true}
	,	password: String 
});

var DeveloperRoleSchema = new Schema({
	user: {type:ObjectId, ref:'UserSchema'}
	, testResult: {type: Number, default: 0}
	, app: {type:ObjectId, ref:'AppSchema'}
})

var AdminRoleSchema = new Schema({
	user: {type:ObjectId, ref:'UserSchema'}
})

var LicenseModel = mongoose.model('License', LicenseSchema);
exports.License = LicenseModel;

var AppModel = mongoose.model('App', AppSchema);
exports.App = AppModel

var CustomerModel = mongoose.model('Customer', CustomerSchema);
exports.Customer = CustomerModel; 

var UserModel = mongoose.model('User', UserSchema);
exports.User = UserModel;

var DeveloperRoleModel = mongoose.model('DeveloperRole', DeveloperRoleSchema);
exports.DeveloperRole = DeveloperRoleModel;

var AdminRoleModel = mongoose.model('AdminRole', AdminRoleSchema);
exports.AdminRole = AdminRoleModel;

