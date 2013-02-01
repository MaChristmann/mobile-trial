var mongoose = require('mongoose')
, Schema =  mongoose.Schema
, ObjectId = Schema.Types.ObjectId;

var LicenseSchema = new Schema({
	trialtype: 	{type: String, enum: ['time']}
	, value: 		{type: Number, default: 7}
});

var AppSchema = new Schema({
	identifier: 					{type: String, index: true, unique: true, required:true}
	, enabled: 						{type: Boolean, default: true}
	, maxVersionCode: 		{type: Number, default: 0}
	, updateVersionCode: 	{type: Number, default: 0}
	, graceInterval: 			{type: Number, default: 0}
	, graceRetrys: 				{type: Number, default: 3}
	, validTime: 					{type: Number, default: 0}
	, licenses: 					[LicenseSchema]
	, publicKey: 					{type: String, required:true}
	, privateKey: 				{type: String, required:true}
});

var CustomerSchema = new Schema({
	account: {type:String, required: true}
	, createdAt : {type: Date, required: true}
	, modifiedAt : {type: Date, required: true}
	, app: {type:ObjectId, ref:'App', required: true}
	, versionCode : {
			type: Number,
			min: 1,
			required: true
		}
 });
CustomerSchema.index({account:1, app:1}, {unique: true});
CustomerSchema.pre('save', function (next) {
	this.modifiedAt = new Date();
  next();
});

CustomerSchema.path('versionCode').set(function(v){
	this._prevVersionCode = this.versionCode ? this.versionCode : 1;
	return Math.floor(v);
});

CustomerSchema.path('versionCode').validate(function(val){
	return this._prevVersionCode <= Math.floor(val); 
}, "versionCode must be higher or equal than its prior value");

var UserSchema = new Schema ({
	account: {type:String, index:true, unique:true, required:true}
	,	password: {type: String, required:true}
	, adminRole: {
		isAdmin: {type:Boolean, default:false}
	}
});

var DeveloperRoleSchema = new Schema({
	user: {type:ObjectId, ref:'User', required:true}
	, testResult: {type: String, default: '0', enum:['0', '1', '4']}
	, app: {type:ObjectId, ref:'App', required:true}
})
/*
var AdminRoleSchema = new Schema({
	user: {type:ObjectId, ref:'UserSchema', required:true}
})
*/

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

/*
var AdminRoleModel = mongoose.model('AdminRole', AdminRoleSchema);
exports.AdminRole = AdminRoleModel;
*/
