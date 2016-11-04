/**
* Practical example for Tidings using built-in NOAA data and other data.
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
*/
var defaultReportDatum =
{
	TidingsData:
	{
			Type:'assetladen'
	},
	Name: 'Gangnam Style'
};

var fableConfig = 
{
	Tidings:
	{	// Use the reports defined in the unit test.
		ReportDefinitionFolder: `${__dirname}/reports/`,
		ReportOutputFolder: `${__dirname}/stage/`
	},
	LogStreams:
	[
		{"level": "trace", "path": `${__dirname}/Tidings-ClimateTests-Run.log`},
		{"level": "trace", "streamtype": "prettystream"}
	]
};

var libFable = require('fable').new(fableConfig);
var libTidings = require(__dirname+'/../../source/Tidings.js').new(libFable);

// Start server
var _Orator = libTidings.Orator();
libTidings.connectRoutes(_Orator.webServer);
_Orator.startWebServer(()=>
	{
		libFable.log.info('Server has been started!');
	});
