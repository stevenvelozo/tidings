// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

var libFS = require('fs');
var libPath = require('path');

var recurseFiles = (pPath, pState, fRecursionComplete) =>
{
	libFS.readdir(pPath,
		(pError, pFiles) => 
		{
			if (pError)
			{
			  console.log('Error: '+pError);
			  return;
			}

			// Parse each template entry and explode them if they are wildcards
			var tmpQueue = pState.Fable.Tidings.libraries.Async.queue(
				(pFileName, fPhaseCallback) =>
				{
					libFS.stat(libPath.join(pPath, pFileName),
						(pStatError, pFileStats) =>
						{
							if (pStatError)
								return console.log('Error: ', pStatError);

							if (pFileStats.isDirectory())
								recurseFiles(libPath.join(pPath, pFileName), pStatError, fPhaseCallback);
							else
							{
								pState.Manifest.Templates.push({File:pFileName, Path:pPath});
								fPhaseCallback();
							}
			  			}
			  		);
				},
				1
			);
			tmpQueue.drain = ()=>
			{
				fRecursionComplete(null);
			};
			tmpQueue.push(pFiles, ()=>{});
		}
	);
};

// Walk through the templates and explode any files
module.exports = (pState, fStageComplete) =>
{
	// Parse each template entry and explode them if they are wildcards
	var tmpQueue = pState.Fable.Tidings.libraries.Async.queue(
		(pTaskData, fPhaseCallback)=>
		{
			if (!pTaskData.Recursive)
				fPhaseCallback();
			pTaskData.Ignore = true;
			recurseFiles(pTaskData.Path, pState, fPhaseCallback);
		},
		1
	);
	tmpQueue.drain = ()=>
	{
		pState.Behaviors.stateLog(pState, '...template location explosion complete.');
		fStageComplete(null, pState);
	};
	if (pState.Manifest.Templates.length < 1)
		pState.Manifest.Templates.push({File:"*", Path:pState.Behaviors.parseReportPath('Renderer', pState), Recursive:true});
	tmpQueue.push(pState.Manifest.Templates, ()=>{});
};