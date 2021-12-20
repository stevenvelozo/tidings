
var reportDatum = (
{
	Name: 'The Backstreet Boys'
});

var fableConfig = (
{
	Tidings:
	{
		ReportDefinitionFolder: `${__dirname}/reports/`,
		ReportOutputFolder: `${__dirname}/../stage/`,
	},
	LogStreams:
	[
		{
			level: 'trace',
			path: `${__dirname}/../Tests-Run.log`,
		},
		{
			level: 'trace',
			streamtype: 'prettystream',
		}
	]
});


var Chai = require('chai');
var Expect = Chai.expect;

var libFable = require('fable').new(fableConfig);
var libTidings = require('../source/Tidings.js');

var GLOBAL_REPORT_HASH = false;

suite
(
	'Tidings Failed Reports',
	() =>
	{
		setup (() => {});

		suite
		(
			'Failed Reporting',
			() =>
			{
				test
				(
					'try to generate a report with a bad underscore template',
					(fDone) =>
					{
						var testTidings = libTidings.new(libFable);

						var testReportGUID = testTidings.render({TidingsData:{Type:'badtemplate'}, Name: "The Mickey Mouse Club"},fDone);
						GLOBAL_REPORT_HASH = testReportGUID;

						Expect(testReportGUID).to.be.a('string');
					}
				);
				test
				(
					'get report status',
					(fDone) =>
					{
						var testTidings = libTidings.new(libFable);

						testTidings.getReportStatus(GLOBAL_REPORT_HASH,
							(pError, pData)=>
							{
								Expect(pData).to.be.a('string');
								var tmpData = JSON.parse(pData);
								Expect(tmpData.Status.Rendered).to.equal(true);
								Expect(tmpData.Errors.length > 0);
								fDone();
							}
						);
					}
				);
			}
		);
	}
);
