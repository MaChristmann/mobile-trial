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
		
			//Get Private Key	
			var indexPrivateEnd = data.indexOf("-----END PRIVATE KEY-----") != -1 
															? data.indexOf("-----END PRIVATE KEY-----") + "-----END PRIVATE KEY-----".length
															: data.indexOf("-----END RSA PRIVATE KEY-----") + "-----END RSA PRIVATE KEY-----".length;
			var privateKey = data.slice(0, indexPrivateEnd);

			//Get Public Key
			var indexPublicEnd = data.indexOf("-----END PUBLIC KEY-----") + "-----END PUBLIC KEY-----".length;
			var publicKey = data.slice(indexPrivateEnd+1, indexPublicEnd);
			// Remove divider
			publicKey = publicKey.replace("-----BEGIN PUBLIC KEY-----", "");
			publicKey = publicKey.replace("-----END PUBLIC KEY-----", "");
			// Remove Linebreaks
			publicKey = publicKey.replace(/\s/gm, '');

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