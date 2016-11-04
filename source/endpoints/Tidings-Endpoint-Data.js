/**
* Get the Report Datum
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
/**
* Get the Datum for a particular report
*/
module.exports = (pRequest, pResponse, fNext) =>
{
	var tmpUUID = pRequest.params.UUID;
	
	if ((typeof(tmpUUID) !== 'string') || (tmpUUID.length < 1))
	{
		// Invalid UUID
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report datum: invalid UUID', {}, pRequest, pResponse, fNext);
	}

	pRequest.Tidings.commonservices.log.info('Delivering the Datum for '+tmpUUID);
	pRequest.Tidings.getReportData(tmpUUID,
		(pError, pData)=>
		{
			if (pError)
				return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report datum: invalid UUID', {}, pRequest, pResponse, fNext);

			pResponse.write(pData);
			pResponse.end();
			return fNext();
		}
	);
};
