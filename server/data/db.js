var mongoose = require('mongoose')
, Schema =  mongoose.Schema
, ObjectId = Schema.Types.ObjectId;

var ConstraintSchema = new Schema({
	trialtype: {type:String, enum: ['days'], unique:true}
	, value: Number
});

var AppSchema = new Schema({
	identifier: {type: String, index: true, unique: true}
	, constraints: [ConstraintSchema]
});

var CustomerSchema = new Schema({
	customerid: {type:String, index:true, unique: true}
	, createdAt : Date
	, app: {type:ObjectId, ref:'AppSchema'}
});

var ConstraintModel = mongoose.model('Constraint', ConstraintSchema);
exports.Constraint = ConstraintModel;

var AppModel = mongoose.model('App', AppSchema);
exports.App = AppModel

var CustomerModel = mongoose.model('Customer', CustomerSchema);
exports.Customer = CustomerModel;

