
var reportDatum = (
{
	Name: 'Joan of Arc'
});

var fableConfig = (
{
	APIServerPort: 9042,
	Tidings:
	{
		ReportDefinitionFolder: `${__dirname}/reports/`,
		ReportOutputFolder: `${__dirname}/../stage/`
	},
	LogStreams:
	[
		{
			level: 'trace',
			path: `${__dirname}/../Tests-Run.log`
		},
		{
			level: 'trace',
			streamtype: 'prettystream'
		}
	]
});


var Chai = require('chai');
var Expect = Chai.expect;

var libFable = require('fable').new(fableConfig);
var libTidings = require('../source/Tidings.js');
var libRequest = require('request');


var GLOBAL_REPORT_HASH = false;
var GLOBAL_DELETE_REPORT_HASH = false;

suite
(
	'Tidings Basic Report',
	() =>
	{
		setup (() => {});

		suite
		(
			'Basic Reporting',
			() =>
			{
				test
				(
					'generate a simple report',
					(fDone) =>
					{
						var testTidings = libTidings.new(libFable);

						GLOBAL_DELETE_REPORT_HASH = testTidings.render(reportDatum,
							()=>
							{
								Expect(GLOBAL_DELETE_REPORT_HASH).to.be.a('string');
								fDone();
							}
						);
					}
				);
				test
				(
					'generate an asset laden report',
					(fDone) =>
					{
						var testTidings = libTidings.new(libFable);

						var testReportGUID = testTidings.render({TidingsData:{Type:'assetladen'}, Name: 'Billy Corgan'},
							()=>
							{
								GLOBAL_REPORT_HASH = testReportGUID;
								Expect(testReportGUID).to.be.a('string');
								fDone();
							}
						);
					}
				).timeout(10000);
				test
				(
					'get report datum',
					(fDone) =>
					{
						var testTidings = libTidings.new(libFable);

						testTidings.getReportData(GLOBAL_REPORT_HASH,
							(pError, pData)=>
							{
								Expect(pError).to.be.null;
								Expect(pData).to.be.a('string');
								Expect(pData).to.contain('Billy Corgan');
								fDone();
							}
						);
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
								Expect(pError).to.be.null;
								Expect(pData).to.be.a('string');
								var tmpData = JSON.parse(pData);
								Expect(tmpData.Status.Rendered).to.equal(true);
								fDone();
							}
						);
					}
				);
				test
				(
					'delete a report',
					(fDone) =>
					{
						var testTidings = libTidings.new(libFable);
						testTidings.deleteReport(GLOBAL_DELETE_REPORT_HASH,
							(pError)=>
							{
								Expect(pError).to.be.null;
								Expect(pError).to.equal(null);
								fDone();
							}
						);
					}
				);
				let _Orator;
				test
				(
					'request a report from the server',
					(fdone)=>
					{
						var testTidings = libTidings.new(libFable);
						_Orator = testTidings.Orator();
						testTidings.connectRoutes(_Orator.webServer);
						testTidings.connectOutputRoutes(_Orator);
						testTidings.connectDefinitionRoutes(_Orator);
						_Orator.startWebServer(()=>
							{
								libRequest(
									{
										method:  'POST',
										url:     'http://localhost:9042/1.0/ReportSync',
										json:    {TidingsData:{Type:'assetladen'}, Name: 'Billy Corgan'}
									},
								(pError, pResponse, pBody)=>
								{
									Expect(pError).to.be.null;
									Expect(pBody).to.be.an('object');
									Expect(pBody.GUIDReportDescription).to.be.a('string');
									Expect(pBody.Error).to.equal(undefined);
									fdone();
								});
							}
						);
					}
				// Change the test timeout to 10 seconds for slow docker containers running unit tests
				).timeout(10000);
				let tmpViaAPIPayload;
				let tmpViaAPIError;
				test
				(
					'request a report from the server (viaapi)',
					(fDone)=>
					{
						_Orator.webServer.post('/1.0/viaapi', (pRequest, pResponse, fNext) =>
						{
							tmpViaAPIPayload = pRequest.body;
							if (tmpViaAPIError)
							{
								pResponse.send(500, tmpViaAPIError);
								return;
							}
							_Orator.log.info('viaapi request', {body: pRequest.body});
							pResponse.header('Content-Type', 'application/pdf');
							pResponse.send('not an actual pdf');
							fNext();
						});
						libRequest(
							{
								method:  'POST',
								url:     'http://localhost:9042/1.0/ReportSync',
								json:    { TidingsData: { Type:'assetladen', Renderer: 'pdfapi' }, Name: 'Billy Corgan' },
							},
						(pError, pResponse, pBody)=>
						{
							Expect(pError).to.be.null;
							Expect(pBody).to.be.an('object');
							Expect(pBody.GUIDReportDescription).to.be.a('string');
							Expect(pBody.Error).to.not.exist;
							Expect(tmpViaAPIPayload).to.be.an('object');
							Expect(tmpViaAPIPayload.URL).to.be.a('string');
							Expect(tmpViaAPIPayload.URL).to.include('http://localhost:9042/1.0/Report/' + pBody.GUIDReportDescription);
							fDone();
						});
					}
				// Change the test timeout to 10 seconds for slow docker containers running unit tests
				).timeout(10000);
				test
				(
					'request a report from the server (viaapi, fails all retries)',
					(fDone)=>
					{
						tmpViaAPIError = { Error: 'broked' };
						libRequest(
							{
								method:  'POST',
								url:     'http://localhost:9042/1.0/ReportSync',
								json:    { TidingsData: { Type:'assetladen', Renderer: 'pdfapi' }, Name: 'Billy Corgan' },
							},
						(pError, pResponse, pBody)=>
						{
							//FIXME: below is what happens now, but since all the rasterize calls failed, below is probably wrong...
							Expect(pError).to.be.null;
							Expect(pBody).to.be.an('object');
							Expect(pBody.GUIDReportDescription).to.be.a('string');
							Expect(pBody.Error).to.not.exist;
							Expect(tmpViaAPIPayload).to.be.an('object');
							Expect(tmpViaAPIPayload.URL).to.be.a('string');
							Expect(tmpViaAPIPayload.URL).to.include('http://localhost:9042/1.0/Report/' + pBody.GUIDReportDescription);
							fDone();
						});
					}
				// Change the test timeout to 10 seconds for slow docker containers running unit tests
				//FIXME: nice to tune retry strategy backoff here so we don't have to wait as long
				).timeout(60000);
				test('clean up test orator', () => _Orator.stopWebServer());
			}
		);
	}
);
