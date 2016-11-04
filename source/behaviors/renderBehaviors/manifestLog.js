// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

// Log something to the manifest (not fable though)
module.exports = (pManifest, pLogEntry, pIsError) =>
{
	pManifest.Log.push(new Date().toUTCString()+': '+pLogEntry);
};
