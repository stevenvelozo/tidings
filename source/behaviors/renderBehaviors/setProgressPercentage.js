// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

module.exports = (pState, pPercentage, fCallback) =>
{
	if (pPercentage <= pState.Manifest.Status.CompletionProgress)
	{
		return fCallback(null, pState);
	}

	pState.Manifest.Status.CompletionProgress = pPercentage;

	//pState.Behaviors.stateLog(pState.Manifest.Status.CompletionProgress + '%');

	return fCallback(null, pState);
};
