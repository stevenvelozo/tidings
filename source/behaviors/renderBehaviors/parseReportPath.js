// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

module.exports = (pPath, pState) =>
{
	var tmpPath = pPath ? pPath : 'Stage';

	if (pState.Manifest.Metadata.Locations.hasOwnProperty(tmpPath))
		tmpPath = pState.Manifest.Metadata.Locations[tmpPath];

	// Now check the ancestry
	if (!pState.Libraries.DropBag.checkHeritage({Path:tmpPath, Lineage:pState.Manifest.Metadata.Locations.Root}, ()=>{}))
		// If the ancestry check fails, don't allow the write and default to stage
		tmpPath = pState.Manifest.Metadata.Locations.Stage;

	return tmpPath;
};