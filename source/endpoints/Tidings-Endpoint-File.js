/**
* Get a Report File
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
/**
* Get a File for a particular report
*/
module.exports = (pRequest, pResponse, fNext) =>
{
	var tmpUUID = pRequest.params.UUID;
	if ((typeof(tmpUUID) !== 'string') || (tmpUUID.length < 1))
	{
		// Invalid UUID
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report File: invalid UUID', {}, pRequest, pResponse, fNext);
	}

	var tmpFileName = pRequest.params.FileName;
	if ((typeof(tmpFileName) !== 'string') || (tmpFileName.length < 1))
	{
		// Invalid UUID
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report File: invalid File Name', {}, pRequest, pResponse, fNext);
	}

	pRequest.Tidings.commonservices.log.info('Delivering the File ['+tmpFileName+'] for '+tmpUUID);
	pRequest.Tidings.libraries.DropBag.readFile({Stream: true, File: tmpFileName, Path: pRequest.Tidings.fable.settings.Tidings.ReportOutputFolder+tmpUUID+'/Stage' },
		(pError, pData)=>
		{
			if (pError)
				return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report File: '+pError, {}, pRequest, pResponse, fNext);

			pResponse.header("Content-Type", pData.contentType);
			pResponse.header("Content-Length", pData.length);

			var tmpStream = pData.getStream();

			tmpStream.pipe(pResponse);
			tmpStream.on('error', (pError)=>
			{
				return fNext(pError);
			});
			tmpStream.once
			(
				'end',
				fNext
			);
		}
	);
};
