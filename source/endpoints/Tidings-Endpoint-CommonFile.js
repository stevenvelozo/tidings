/**
* Get the Report File
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
/**
* Get a common File for a particular report type
*/
module.exports = (pRequest, pResponse, fNext) =>
{
	var tmpReportType = pRequest.params.ReportType;
	if ((typeof(tmpReportType) !== 'string') || (tmpReportType.length < 1))
	{
		// Invalid Report Type
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report common File: invalid Report Type', {}, pRequest, pResponse, fNext);
	}

	var tmpFileName = pRequest.params.FileName;
	if ((typeof(tmpFileName) !== 'string') || (tmpFileName.length < 1))
	{
		// Invalid UUID
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report common File: invalid File Name', {}, pRequest, pResponse, fNext);
	}

	pRequest.Tidings.commonservices.log.info('Delivering the common file '+tmpFileName+' for '+tmpReportType);

	pRequest.Tidings.libraries.DropBag.readFile({Stream: true, File: tmpFileName, Path: pRequest.Tidings.fable.settings.Tidings.ReportDefinitionFolder+tmpReportType+'/common' },
		(pError, pData)=>
		{
			if (pError)
				return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report common File: '+pError, {}, pRequest, pResponse, fNext);

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
