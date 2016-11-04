/**
* Get a Report Default File
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
/**
* Get the Default File for a particular report
*/
module.exports = (pRequest, pResponse, fNext) =>
{
	var tmpUUID = pRequest.params.UUID;
	if ((typeof(tmpUUID) !== 'string') || (tmpUUID.length < 1))
	{
		// Invalid UUID
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report File: invalid UUID', {}, pRequest, pResponse, fNext);
	}

	pRequest.Tidings.commonservices.log.info('Delivering the default file for '+tmpUUID);
	// Get the manifest
	pRequest.Tidings.getReportStatus(tmpUUID,
		(pManifestError, pManifestData)=>
		{
			if (pManifestError)
				return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report Manifest for default file: invalid UUID', {}, pRequest, pResponse, fNext);

			var tmpManifest = JSON.parse(pManifestData);
			pRequest.Tidings.libraries.DropBag.readFile({Stream: true, File: tmpManifest.Metadata.DefaultFile, Path: pRequest.Tidings.fable.settings.Tidings.ReportOutputFolder+tmpUUID+'/Stage' },
				(pError, pData)=>
				{
					if (pError)
						return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report default File: '+pError, {}, pRequest, pResponse, fNext);
		
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
		}
	);
};

