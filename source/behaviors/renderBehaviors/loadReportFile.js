// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

module.exports = (pState, pPath, pFileName, fCallback) =>
{
	pState.Libraries.DropBag.readFile(
		{
			Path:pState.Behaviors.parseReportPath(pPath, pState),
			File:pFileName
		},
		(pError, pData)=>
		{
			if (pError)
			{
				pState.Behaviors.stateLog(pState, 'Error loading file: '+JSON.stringify(pPath)+' '+JSON.stringify(pFileName)+' '+pError, true);
				return fCallback(pError);
			}
			else
				return fCallback(pError, pData);
		});
};