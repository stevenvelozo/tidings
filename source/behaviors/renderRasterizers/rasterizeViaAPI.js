// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
 * @license MIT
 * @author <steven@velozo.com>
 */
/*
Allows you to rasterize the report via an API endpoint. Define the request you make using your task data property 'Request' property
and/or use the property ViaAPIRequest on Scratch to define the request. See the "request" library for more details on what values you can use.
 */
const libFS = require('fs');
const libRequest = require('request');

module.exports = (pTaskData, pState, fCallback) =>
{

	if (!pTaskData.Path)
	{
		pTaskData.Path = pState.Manifest.Metadata.Locations.Stage;
	}

	if (!pTaskData.OutputPath)
	{
		pTaskData.OutputPath = pState.Manifest.Metadata.Locations.Stage;
	}

	if (!pTaskData.Output)
	{
		fCallback(new Error('Output file name not provided for rasterizeViaAPI'), pState);
	}

	// Load settings from the scratch state if they are there (so reports can pass them in)
	const tmpViaAPISettings = (typeof(pState.Scratch.ViaAPIRequest) !== 'undefined') ? pState.Scratch.ViaAPIRequest : {};
	const tmpRequest = Object.assign({}, pTaskData?.Request || {}, tmpViaAPISettings);

	// Need to move away from libFS only ASAFP so this works with dropbag.
	// Because these tools are external, they likely need to happen locally in scratch then upload the files that are generated.
	// Talk to Jason about how best to manage this and for now only support FS.
	const tmpOutputStream = libFS.createWriteStream(pTaskData.OutputPath  + pTaskData.Output);
	tmpOutputStream.on('finish',
		() =>
		{
			fCallback(null, pState);
		}
	);
	tmpOutputStream.on('error',
		(pError) =>
		{
			pState.Behaviors.stateLog(pState, 'Error writing pdf from ViaAPI: ' + JSON.stringify(tmpRequest) + ' ' + pError, pError);
		}
	);

	try
	{
		pState.Behaviors.stateLog(pState, `Generating pdf from ViaAPI` + JSON.stringify(tmpRequest));
		makeRequestWithRetry(tmpRequest,
			(pRequestError, pResponse) =>
			{
				if(pRequestError)
				{
					tmpOutputStream.close();
					pState.Behaviors.stateLog(pState, 'Error generating pdf with ViaAPI: ' + JSON.stringify(tmpRequest) + ' ' + pRequestError, pRequestError);
				}
				else
				{
					pResponse.on('error',
						(pError) =>
						{
							pState.Behaviors.stateLog(pState, 'Error generating pdf with ViaAPI: ' + JSON.stringify(tmpRequest) + ' ' + (pError.message || pError), pError);
						}
					);
					pResponse.pipe(tmpOutputStream);
				}
			});
	}
	catch (pError)
	{
		fCallback(new Error(`Problem rasterizing using the ViaAPI library: ${pError.message}`), pState);
	}
};


function makeRequestWithRetry(pOptions, fCallback)
{
	var maxRetries = pOptions.maxRetries || 3;
	pOptions._retryCount = pOptions._retryCount || 0;
	libRequest(pOptions)
		.on('error', (error) =>
		{
			fCallback(error, null);
		})
		.on('response', (response) =>
		{
			if (response.statusCode === 429)
			{
				pOptions._retryCount++;

				if(pOptions._retryCount > maxRetries)
				{
					return fCallback(null, response, output);
				}

				// use our header or do a retry after exp backoff or from our header depending on who tells us to wait
				let timeoutTime = response.headers['retry-after'] ||
					Math.min(5, pOptions._retryCount * pOptions._retryCount);

				console.log('Rate limited, retrying after ' + timeoutTime + ' seconds');
				setTimeout(() =>
				{
					makeRequestWithRetry(pOptions, fCallback);
				}, timeoutTime * 1000);
			}
			else
			{
				return fCallback(null, response, null);
			}
		})
}

