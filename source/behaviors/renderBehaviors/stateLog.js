// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

// Log something to the manifest with the state passed in
module.exports = (pState, pLogEntry, pIsError) =>
{
	pState.Manifest.Log.push(new Date().toUTCString()+': '+pLogEntry);

	if (pIsError)
		pState.Fable.log.error(pLogEntry);
	else
		pState.Fable.log.info(pLogEntry);
};