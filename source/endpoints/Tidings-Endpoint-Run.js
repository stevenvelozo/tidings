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
	pRequest.Datum = pRequest.body;
	
	if (typeof(pRequest.Datum) !== 'object')
	{
		// Invalid Datum
		return pRequest.Tidings.commonservices.sendCodedError('Error Rendering Report: invalid Datum', {}, pRequest, pResponse, fNext);
	}

	pRequest.Tidings.commonservices.log.info('Starting to render a report');
	var tmpReportGUID = pRequest.Tidings.render(pRequest.Datum,
		(pError)=>
		{
			if (pError)
				pRequest.Tidings.commonservices.fable.log.error('Error Rendering Report: '+pError, {}, pRequest, pResponse, fNext);
			// Now get the manifest
			pRequest.Tidings.getReportStatus(tmpReportGUID,
				(pError, pData)=>
				{
					if (pError)
						return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report Manifest: invalid UUID', {}, pRequest, pResponse, fNext);
					
					var tmpReportManifest = JSON.parse(pData);
					
					// Now serve up the default file.
					pRequest.Tidings.libraries.DropBag.readFile({Stream: true, File: tmpReportManifest.Metadata.DefaultFile, Path: pRequest.Tidings.fable.settings.Tidings.ReportOutputFolder+tmpReportGUID+'/Stage' },
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
					return fNext();
				}
			);
		});
};
