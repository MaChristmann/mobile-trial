Mobile-Trial
============

# ToDo: 

## Server
* Setup
	* Remove setup.json file after setup
* Features
	* ValidTime set to 0 should return a validtime till the end of trial period
*	Security
	* Use HTTPS instead of HTTP
	* Encrypt response with private key
	* _DONE 11-18-2012_ Use hashed passwords for user accounts 
	* Allow access of admins and developers based on ip addresses/range
* Tests
	* Test License service
	* Test Developer service
	* Test Customer service
	* Test App service
	* Test User service
	* Test Authenticate service
* Refactoring
	* Merge Register service and App service to App service
	* Branch services into routing layer and service layer (Make's testing easier)

## Client
* Ui components 
	* Create Ui Components
* Security
	* Use HTTPS instead of HTTP
	* Decrypt response with public key
* Test
	* Add test project

## Sample
* Add sample: time based, close app after trial expired
* Add sample: time based, restrict features after trial expired

## Configurator
* Features
	* App configuration
		* Admin should be able to set License Type/Value
		* Admin should be able to set Valid Time
		* Admin should be able to set Grace Time
		* Admin should be able to set Grace Retrycount  
		* Admin should be able to set max. versionCode number
		* Admin should be able to set update versionCode number
	* User configuration
		* Admin should be able to create/delete user
		* Admin should be able to set/unset user as developer
		* Admin should be able to set/unset user as admin
	* License Test
		* Developer should be able to set testResponse