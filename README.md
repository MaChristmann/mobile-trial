Mobile-Trial
============

# ToDo: 

## Server
* Setup
	* _DONE 11-20-2012_ Remove setup.json file after setup
	* _DONE 11-30-2012_ Make Setup use the service methods (requires refactoring of services)
	* _DONE 12-05-2012_ Clean database before running setup
* Features
	* _DONE 12-05-2012_ ValidTime set to 0 should return a validtime till the end of trial period
	* _DONE 11-30-2012_ Activate/Deactive the license check 
	* _DONE 01-27-2013_ List all developers for an app
	* _DONE 01-30-2013_ List all admins (by listing users which have an admin object)
*	Security
	* _DONE 01-17-2013_ Use HTTPS instead of HTTP
	* _DONE 11-20-2012_ Create digital signature with openssl and sign response data with RSA privatekey
	* _DONE 11-18-2012_ Use hashed passwords for user accounts 
	* _DONE 12-05-2012_ Allow access of admins and developers based on ip v4 addresses/range
	*  Allow access of admins and developers based on ip v6 addresses/range
* Privacy
	* _DONE 12-04-2012_ Hash account emails from customers using sha1.. They don't need to be readable
* Tests (Currently 164  test cases)
	* _DONE 12-19-2012_ Test License service
	* _DONE 12-26-2012_ Test Developer service
		* _DONE 01-27-2013_ Test developer.list
	* _DONE 12-26-2012_ Test Customer service
	* _DONE 12-18-2012_ Test App service
		* _DONE 01-31-2013_ Test App.update is setting 'enabled' parameter correctly
	* _DONE 12-27-2012_ Test User service
	* _DONE 12-21-2012_ Test Authenticate service
* Refactoring
	* _DONE 11-29-2012_ Merge Register service and App service to App service
	* _DONE 11-30-2012_ Branch services into routing layer and service layer (Make's testing easier)
* Logging
	* _DONE 01-17-2013_ Add file based logging 
	* _DONE 01-17-2013_ Remove all console.log based logging messages

## Client
* Ui components 
	* _DONE 01-24-2013_ Create dialog for license status 'Retry'
	* _DONE 01-24-2013_ Create dialog for license status 'NotLicensed'
* Security
	* _DONE 01-23-2013_ Use HTTPS instead of HTTP
	* _DONE 11-21-2013_ Verify signed response with RSA public key
* Test
	* _DONE 01-25-2013_ Add test project
* JavaDoc
	* Add JavaDoc documentation 

## Sample
* _DONE 01-25-2013_ Add sample: time based, close app after trial expired
* _DONE 01-25-2013_ Add sample: time based, restrict features after trial expired

## GitHub Documentation
* Add HowTo documentation
* Add Feature documentation
* Add some explanation and diagrams about how the system works

## Configurator
* Features
	* App management
		* Admin should be able to create/read/configure/delete an app
		* Developer should be able to see the list of apps he is asigned to and read their configurations
	* App configuration
		* Admin should be able to set License Type/Value
		* Admin should be able to set Valid Time
		* Admin should be able to set Grace Time
		* Admin should be able to set Grace Retrycount  
		* Admin should be able to set max. versionCode number
		* Admin should be able to set update versionCode number
		* Admin should be able to set/unset user as developer
	* User configuration
		* Admin should be able to create/delete user
		* Admin should be able to set/unset user as admin
	* License Test
		* Developer should be able to set testResponse

