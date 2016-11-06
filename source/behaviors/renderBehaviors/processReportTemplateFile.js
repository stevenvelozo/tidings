// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

var libTemplateValidation = require('./templateValidation.js');

module.exports = (pTaskData, pState, fCallback) =>
{
	// This gets set by the auto explode
	if (pTaskData.Ignore)
		return fCallback();

	var tmpFileName = pTaskData.File;
	// If no path was supplied, use the renderer path
	if (!pTaskData.hasOwnProperty('Path') || !pTaskData.Path)
		pTaskData.Path = pState.Manifest.Metadata.Locations.ReportDefinition + '/' + pState.Manifest.Metadata.Renderer;

	pState.Libraries.DropBag.readFile(pTaskData,
		(pReadError, pData)=>
		{
			// We shouldn't bail out because one template didn't load so don't alter the callback.
			if (pReadError)
			{
				pState.Behaviors.stateLog(pState, 'Error loading template: '+JSON.stringify(pTaskData)+' '+pReadError, true);
				return fCallback();
			}
			else
			{
				// Function to safely execute underscore templates
				var generateTemplatedContent = (pTemplateString, pTemplateDataObject) =>
				{
					var tmpContent = '';
					var tmpTemplate = false;
					try
					{
						// Use underscore to generate the template string
						tmpTemplate = pState.Fable.Tidings.libraries.Underscore.template(pTemplateString);
					}
					catch(pTemplateParsingError)
					{
						// Uh-oh!  The user has an error in their template.
						pState.Behaviors.stateLog(pState, 'Error parsing template: '+pTemplateParsingError, true);
						pState.Manifest.Errors.push(
							{
								Type:'Template Parsing Error',
								Template: tmpFileName,
								Location: pTaskData.Path,
								Source: pData,
								GeneratedCode: pTemplateParsingError.source,
								ValidationData: libTemplateValidation(pData)
							});
					}
					try
					{
						// Now generate the content
						if (tmpTemplate)
							tmpContent = tmpTemplate(pState);
					}
					catch(pTemplateExecutionError)
					{
						// Uh-oh!  The user has an error executing their template.  Most likely it expects data in the datum that doesn't exist.
						pState.Behaviors.stateLog(pState, 'Error executing template: '+pTemplateExecutionError, true);
					}

					return tmpContent;
				};
				// Generate the content and save it to the defined location
				pState.Behaviors.saveReportFile(pState, generateTemplatedContent(pData, pState), pTaskData.OutputPath, tmpFileName, fCallback);
			}
		});
};