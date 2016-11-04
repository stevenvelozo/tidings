// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

// Stage write functions
module.exports = (pData, pFileName, pState, fCallback) =>
{
	// Now write out the file
	pState.Libraries.DropBag.storeFile(
		{
			File: pFileName,
			Path: pState.Manifest.Metadata.Locations.Stage,
			// The template is actually being rendered here
			Data: pData
		},
		(pPersistError)=>
		{
			// We shouldn't bail out because one template didn't load so don't alter the callback.
			if (pPersistError)
				pState.Behaviors.stateLog(pState, 'Error writing stage data: '+pState.Manifest.Metadata.Locations.Stage+' -> '+pFileName+': '+pPersistError, true);

			pState.Behaviors.stateLog(pState, '--> Wrote stage data: '+pFileName+' TO '+pState.Manifest.Metadata.Locations.Stage);
			return fCallback();
		});
};
