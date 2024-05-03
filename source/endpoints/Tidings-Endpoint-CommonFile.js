/**
* Get the Report File
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
const libPath = require('path');
/**
* Get a common File for a particular report type
*/

const serveGlobalFile = (pRequest, pResponse, fNext) =>
{
	// The split removes query string parameters so they are ignored by our static web server.
	// The substring cuts that out from the file path so relative files serve from the folders and server
	const tmpRequestPath = pRequest.url.split('?');
	if (tmpRequestPath[0].length < 10)
	{
		// Invalid file path -- even 10 is too small
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving global report file: problematic url [' + tmpRequestPath[0] + ']');
	}
	const tmpRequestedFilePathParts = tmpRequestPath[0].split('/Global/');
	if (tmpRequestedFilePathParts.length < 2)
	{
		// Invalid file path -- even 10 is too small
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving global report file: problematic url [' + tmpRequestPath[0] + ']');
	}

	// Global folders internally is always an array, client could provide it as a string value as well though
	const globalFolders = Array.isArray(pRequest.Tidings.fable.settings.Tidings.GlobalAssetFolder) ?
		pRequest.Tidings.fable.settings.Tidings.GlobalAssetFolder :
		[pRequest.Tidings.fable.settings.Tidings.GlobalAssetFolder];

	// make the requested file relative to each of our global folders
	const relativeFilePaths = globalFolders.map(pFolder => libPath.normalize(pFolder + tmpRequestedFilePathParts[1]));

	findFirstExistentFile(relativeFilePaths, (pError, pFilePath) =>
	{
		// if no file was found we get an error and no pFilePath
		if(pError)
		{
			return pRequest.Tidings.commonservices.sendCodedError('Error retrieving global File: ' + pError, {}, pRequest, pResponse, fNext);
		}

		const tmpRequestFileName = libPath.basename(pFilePath);
		const tmpRequestFilePath = libPath.dirname(pFilePath);

		pRequest.Tidings.commonservices.log.info('Delivering the global File [' + tmpRequestFilePath + '] + [' + tmpRequestFileName + ']');

		pRequest.Tidings.libraries.DropBag.readFile({Stream: true, File: tmpRequestFileName, Path:tmpRequestFilePath  }, (pError, pData) =>
		{
			if (pError)
			{
				return pRequest.Tidings.commonservices.sendCodedError('Error retrieving global File: ' + pError, {}, pRequest, pResponse, fNext);
			}

			pResponse.header('Content-Type', pData.contentType);
			pResponse.header('Content-Length', pData.length);

			const tmpStream = pData.getStream();

			tmpStream.pipe(pResponse);
			tmpStream.on('error', (pError) =>
			{
				return fNext(pError);
			});
			tmpStream.once
			(
				'end',
				fNext
			);
		});
	});

	/**
	 * Finds the first file which exists in the given paths.
	 * If no file is found an error is returned to the pCallback
	 * @param {Array<string>} pPaths
	 * @param pCallback
	 */
	function findFirstExistentFile(pPaths, pCallback)
	{
		if(pPaths.length === 0)
		{
			return pCallback(new Error('No file found in paths'), null);
		}
		const tmpRequestFileName = libPath.basename(pPaths[0]);
		const tmpRequestFilePath = libPath.dirname(pPaths[0]);

		pRequest.Tidings.libraries.DropBag.fileExists({File: tmpRequestFileName, Path: tmpRequestFilePath}, (pError, pExists) =>
		{
			if(pError)
			{
				return pCallback(pError, null);
			}

			if(pExists)
			{
				return pCallback(null, pPaths[0]);
			}
			else
			{
				return findFirstExistentFile(pPaths.slice(1), pCallback);
			}
		});
	}
};



module.exports = (pRequest, pResponse, fNext) =>
{
	// Test if this is a global file.
	if (pRequest.url.indexOf('/Global/') !== -1)
	{
		// If it is a global file, use that route instead.
		return serveGlobalFile(pRequest, pResponse, fNext);
	}

	const tmpReportType = pRequest.params.ReportType;
	if ((typeof(tmpReportType) !== 'string') || (tmpReportType.length < 1))
	{
		// Invalid Report Type
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report common File: invalid Report Type', {}, pRequest, pResponse, fNext);
	}

	const tmpFileName = pRequest.params.FileName;
	if ((typeof(tmpFileName) !== 'string') || (tmpFileName.length < 1))
	{
		// Invalid UUID
		return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report common File: invalid File Name', {}, pRequest, pResponse, fNext);
	}

	pRequest.Tidings.commonservices.log.info('Delivering the common file ' + tmpFileName + ' for ' + tmpReportType);

	pRequest.Tidings.libraries.DropBag.readFile({Stream: true, File: tmpFileName, Path: pRequest.Tidings.fable.settings.Tidings.ReportDefinitionFolder + tmpReportType + '/common' },
		(pError, pData) =>
		{
			if (pError)
			{
				return pRequest.Tidings.commonservices.sendCodedError('Error retrieving report common File: ' + pError, {}, pRequest, pResponse, fNext);
			}

			pResponse.header('Content-Type', pData.contentType);
			pResponse.header('Content-Length', pData.length);

			const tmpStream = pData.getStream();

			tmpStream.pipe(pResponse);
			tmpStream.on('error', (pError) =>
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
