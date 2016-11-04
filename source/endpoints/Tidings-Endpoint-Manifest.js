/**
* Get the Report Manifest
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
/**
* Get the Manifest for a particular report
*/
module.exports = (pRequest, pResponse, fNext) =>
{
	var tmpUUID = pRequest.params.UUID;
	
	if ((typeof(tmpUUID) !== 'string') || (tmpUUID.length < 1))
	{
		// Invalid UUID
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report Manifest: invalid UUID', {}, pRequest, pResponse, fNext);
	}

	pRequest.Tidings.commonservices.log.info('Delivering the Manifest for '+tmpUUID);
	pRequest.Tidings.getReportStatus(tmpUUID,
		(pError, pData)=>
		{
			if (pError)
				return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report Manifest: invalid UUID', {}, pRequest, pResponse, fNext);

			pResponse.write(pData);
			pResponse.end();
			return fNext();
		}
	);
};
