// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

module.exports = (pState, fStageComplete) =>
{
	// Persist the manifest (and separately the datum)
	pState.Libraries.DropBag.storeFile(
	{
		Data: JSON.stringify(pState.Manifest, null, 4),
		File: 'Manifest.json',
		Path: pState.Fable.settings.Tidings.ReportOutputFolder+pState.Manifest.Metadata.LocationHash
	},
	()=>
	{
		pState.Behaviors.stateLog(pState, '...persisted the Report Manifest for '+pState.Manifest.Metadata.LocationHash+' type '+pState.Manifest.Metadata.Type);
		fStageComplete(false, pState);
	});
};