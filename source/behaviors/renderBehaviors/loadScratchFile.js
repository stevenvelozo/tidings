// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

module.exports = (pState, pFileName, fCallback) =>
{
	return pState.Behaviors.loadFile(pState, pState.Manifest.Metadata.Locations.Scratch, pFileName, fCallback);
};
