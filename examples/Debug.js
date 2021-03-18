/**
* Testbed Application for Debugging the Engine
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
*/
var runDefaultReport = true;

var defaultReportDatum =
{
	TidingsData:
	{
			Type:'assetladen',
			Renderer: 'pdf'
	},
	Name: 'Totally My Gangnam Style'
};

var fableConfig = 
{
    "TidingsDebug":true,
	Tidings:
	{	// Use the reports defined in the unit test.
		ReportDefinitionFolder: `${__dirname}/../test/reports/`,
		ReportOutputFolder: `${__dirname}/../stage/`,
		GlobalAssetFolder: `${__dirname}/../global/`
	},
	LogStreams:
	[
		{"level": "trace", "path": `${__dirname}/Tidings-Debug-Run.log`},
		{"level": "trace", "streamtype": "prettystream"}
	]
};

var libFable = require('fable').new(fableConfig);
var libTidings = require(__dirname+'/../source/Tidings.js').new(libFable);
var libRequest = require('request');

var _Orator = libTidings.Orator();
libTidings.connectRoutes(_Orator.webServer);
libTidings.connectOutputRoutes(_Orator);
libTidings.connectDefinitionRoutes(_Orator);
_Orator.startWebServer(()=>
	{
		libFable.log.info('Server has been started!');
		if (runDefaultReport)
		{
			var tmpReportGUID = libTidings.render(defaultReportDatum,
				(pError)=>
				{
					if (pError) libFable.log.error('Debugger error: '+pError, pError);
					
						libTidings.getReportData(tmpReportGUID,
							(pError, pData)=>
							{
								if (pError)
									console.log(pError);
							}
						);
				});

				libRequest(
					{
						method:  'POST',
						url:     'http://localhost:8080/1.0/ReportSync',
						json:    {TidingsData:{Type:'assetladen', Renderer:'pdf'}, Name: "Billy Corgan"}
					},
				(pError, pResponse, pBody)=>
				{
						console.log(pBody);
				});			
			libFable.log.info('Rendering report GUID '+tmpReportGUID);
		}
	}
);
