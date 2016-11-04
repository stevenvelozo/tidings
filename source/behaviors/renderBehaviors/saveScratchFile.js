// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

module.exports = (pState, pFileName, pData, fCallback) =>
{
	pState.Libraries.DropBag.storeFile(
		{
			Path:pState.Manifest.Metadata.Locations.Scratch,
			File:pFileName,
			Data:pData
		},
		(pError)=>
		{
			if (pError)
			{
				pState.Behaviors.stateLog(pState, 'Error loading scratch file: '+JSON.stringify(pFileName)+' '+pError, true);
				return fCallback(pError);
			}

			return fCallback();
		});
};