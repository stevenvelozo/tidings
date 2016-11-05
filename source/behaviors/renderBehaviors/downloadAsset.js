// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

// Used for asset gathering.
var libRequest = require('request');


module.exports = (pTaskData, pState, fCallback) =>
{
	pTaskData.RequestStartTime = +new Date();

	var tmpFileName = pTaskData.File;
	// If no path was supplied, use the Asset path
	if (!pTaskData.hasOwnProperty('Path') || !pTaskData.Path)
		pTaskData.Path = 'Asset';
		
	libRequest(pTaskData.URL,
		(pRequestError, pResponse, pBody)=>
		{
			// We shouldn't bail out because one asset didn't download so don't alter the callback.
			if (pRequestError)
			{
				pState.Behaviors.stateLog(pState, 'Error downloading asset: '+JSON.stringify(pTaskData)+' '+pRequestError, true);
				return fCallback();
			}
			
			pTaskData.Size = pBody.length;

			pTaskData.RequestEndTime = +new Date();

			pState.Behaviors.saveReportFile(pState, pBody, pTaskData.Path, tmpFileName, 
				()=>
				{
					pTaskData.PersistCompletionTime = +new Date();
					pTaskData.TotalDownloadTime = pTaskData.PersistCompletionTime - pTaskData.RequestStartTime;
					fCallback();
				}
			);
		});
};