// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Tidings Report Service Common Services
* 
* This provides authorization/authentication/errors/etc.  We may want to 
* centralize these into a separate library since these are identical but
* extend the meadow-endpoints common services.
*
* @class Tidings
* @constructor
*/

module.exports = new function()
{
	function createNew(pFable)
	{
		// If a valid fable object isn't passed in, return a constructor
		if (typeof(pFable) !== 'object')
		{
			return {new: createNew};
		}

		var _Fable = pFable;
		var _Log = _Fable.log;

		var libRestify = require('restify');


		/**
		 * Send an Error Code and Error Message to the client, and log it as an error in the log files.
		 *
		 * @method sendCodedError
		 */
		var sendCodedError = function(pDefaultMessage, pError, pRequest, pResponse, fNext)
		{
			var tmpErrorMessage = pDefaultMessage;
			var tmpErrorCode = 1;
			var tmpScope = null;
			var tmpParams = null;
			var tmpSessionID = null;

			if (typeof(pError) === 'object')
			{
				tmpErrorMessage = pError.Message;
				if (pError.Code)
					tmpErrorCode = pError.Code;
			}
			else if (typeof(pError) === 'string')
			{
				tmpErrorMessage += ' ' + pError;
			}
			if (pRequest.DAL)
			{
				tmpScope = pRequest.DAL.scope;
			}
			if (pRequest.params)
			{
				tmpParams = pRequest.params;
			}
			if (pRequest.UserSession)
			{
				tmpSessionID = pRequest.UserSession.SessionID;
			}

			_Log.warn('API Error: '+tmpErrorMessage, {SessionID: tmpSessionID, RequestID:pRequest.RequestUUID, RequestURL:pRequest.url, Scope: tmpScope, Parameters: tmpParams, Action:'APIError'}, pRequest);
			pResponse.send({Error:tmpErrorMessage, ErrorCode: tmpErrorCode});

			return fNext();
		};


		/**
		 * Send an Error to the client, and log it as an error in the log files.
		 *
		 * @method sendError
		 */
		var sendError = function(pMessage, pRequest, pResponse, fNext)
		{
			var tmpSessionID = null;
			if (pRequest.UserSession)
			{
				tmpSessionID = pRequest.UserSession.SessionID;
			}

			_Log.warn('API Error: '+pMessage, {SessionID: tmpSessionID, RequestID:pRequest.RequestUUID, RequestURL:pRequest.url, Action:'APIError'}, pRequest);
			pResponse.send({Error:pMessage});

			return fNext();
		};




		/**
		* Container Object for our Factory Pattern
		*/
		var tmpFableCommonServices = (
		{
			sendCodedError: sendCodedError,
			sendError: sendError,

			// Restify body parser passed through, for any POST and PUT requests
			bodyParser: libRestify.bodyParser,
			serveStatic: libRestify.serveStatic,

			new: createNew
		});

        // Check if the services are there, add them if they aren't.
		// Turn the common services object into a first-class Fable object
		_Fable.addServices(tmpFableCommonServices);

		return tmpFableCommonServices;
	}

	return createNew();
};
