// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

module.exports = (pData, pFileName, pState, fCallback) =>
{
	// Now write out the file
	pState.Libraries.DropBag.storeFile(
		{
			File: pFileName,
			Path: pState.Manifest.Metadata.Locations.Asset,
			Data: pData
		},
		(pPersistError)=>
		{
			// We shouldn't bail out because one asset didn't save so don't alter the callback.
			if (pPersistError)
				pState.Behaviors.stateLog(pState, 'Error writing asset: '+pState.Manifest.Metadata.Locations.Asset+' -> '+pFileName+': '+pPersistError, true);

			pState.Behaviors.stateLog(pState, '--> Wrote asset: '+pFileName+' TO '+pState.Manifest.Metadata.Locations.Asset);
			return fCallback();
		});
};