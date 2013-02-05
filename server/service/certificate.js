var cp = require('child_process'),
		crypto = require('crypto'),
		fs = require('fs');


exports.create = function(packageName, next){
	var certificateFile = "./temp/" + packageName + "-cert.pem";
	var command = "openssl req -x509 -nodes -days 365 -subj /C=DE/ST=Baden-Wuerttemberg/L=Mannheim/CN=www.mobiletrial.org -newkey rsa:1024 -keyout "
								+ certificateFile + " -out " +  certificateFile + " -pubkey -noout";

	cp.exec(command, function(err, stdout, stderr) {
		if(err){
			next(err);
			return;
		} 
		fs.readFile(certificateFile, "utf8", function(err, data){
			if(err){
				next(err);
				return;
			}
		
			data = data.replace(/\s/gm, '');
			var tmpArr = data.split('-----');

			var privateKey = tmpArr[2];
			var publicKey = tmpArr[6];
			var certificate = "trololol";

			fs.unlink(certificateFile, function(err){
				if(err){
					next(err);
					return;
				}
				next(null, publicKey, privateKey);
			});
		});
	});
}


exports.sign = function(data, priv){
	var signer = crypto.createSign("RSA-SHA1");
	signer.update(data);
	return signer.sign(priv, 'base64');
}