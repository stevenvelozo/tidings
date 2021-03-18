/**
* Get the Report File
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
var libPath = require('path');
/**
* Get a common File for a particular report type
*/

var serveGlobalFile = (pRequest, pResponse, fNext) =>
{
	// The split removes query string parameters so they are ignored by our static web server.
	// The substring cuts that out from the file path so relative files serve from the folders and server
	console.log(pRequest.url);
	var tmpRequestPath = pRequest.url.split("?");
	if (tmpRequestPath[0].length < 10)
	{
		// Invalid file path -- even 10 is too small
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving global report file: problematic url ['+tmpRequestPath[0]+']');
	}
	var tmpRequestedFilePathParts = tmpRequestPath[0].split('/Global/');
	if (tmpRequestedFilePathParts.length < 2)
	{
		// Invalid file path -- even 10 is too small
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving global report file: problematic url ['+tmpRequestPath[0]+']');
	}

	var tmpRequestFileFullPath = libPath.normalize(pRequest.Tidings.fable.settings.Tidings.GlobalAssetFolder+tmpRequestedFilePathParts[1]);
	var tmpRequestFilePath = libPath.dirname(tmpRequestFileFullPath);
	var tmpRequestFileName = libPath.basename(tmpRequestFileFullPath);

	pRequest.Tidings.commonservices.log.info('Delivering the global File ['+tmpRequestFilePath+'] + ['+tmpRequestFileName+']');
	pRequest.Tidings.libraries.DropBag.readFile({Stream: true, File: tmpRequestFileName, Path:tmpRequestFilePath  },
		(pError, pData)=>
		{
			if (pError)
				return pRequest.Tidings.commonservices.sendCodedError('Error retrieving global File: '+pError, {}, pRequest, pResponse, fNext);

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



module.exports = (pRequest, pResponse, fNext) =>
{
	// Test if this is a global file.
	if (pRequest.url.indexOf('/Global/') !== -1)
	{
		// If it is a global file, use that route instead.
		return serveGlobalFile(pRequest, pResponse, fNext);
	}

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
