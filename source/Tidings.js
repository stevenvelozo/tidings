// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Tidings Reporting Service
*
* @class Tidings
* @constructor
*/
const Tidings = function()
{
	const createNew = (pFable) =>
	{
		// If a valid Fable object isn't passed in, return a constructor
		if ((typeof(pFable) !== 'object') || !('fable' in pFable))
		{
			return {new: createNew};
		}
		// What was passed in might be an Orator object, or a Fable object.  We want to work either way.  This does.
		const _Fable = pFable.fable;

		if (!_Fable.settings.hasOwnProperty('Tidings'))
		{
			// Default to what we guess is the tidings calling module folder
			// Assuming it is /some/project/node_modules/Tidings/source/Tidings.js
			_Fable.settings.Tidings = (
				{
					ReportDefinitionFolder: `${__dirname}/../../../reports/`,
					ReportOutputFolder: `${__dirname}/../../../stage/`,
					GlobalAssetFolder: `${__dirname}/../../../global/`,
				}
			);
		}

		// This is used for rasterizers that pull the report HTML and turn the output into a pdf.
		if (!_Fable.settings.Tidings.hasOwnProperty('TidingsServerAddress'))
		{
			_Fable.settings.Tidings.TidingsServerAddress = `http://localhost:${_Fable.settings.APIServerPort || '8080'}`;
		}

		const libReportManifestManagement = require('./Tidings-ReportManifestManagement.js').new(_Fable);

		// These are all of the dependencies available to reports.
		// This is an easy way to let these be extended.
		const _Libraries = { };
		// All of these libraries are accessible from the report by default.
		// These are also passed into the render object.
		_Libraries.Async = require('async');
		_Libraries.DropBag = require('dropbag').new(_Fable); // This manages all the file operations.  Extend here and add settings to persist elsewhere.
		_Libraries.Quantifier = require('quantifier');
		_Libraries.Underscore = require('underscore');
		_Libraries.Moment = require('moment-timezone');
		_Libraries.BigNumber = require('bignumber.js');
		_Libraries.Cheerio = require('cheerio');
		_Libraries.Request = require('request');
		const libChance = require('chance');
		_Libraries.Chance = new libChance();


		const doReportRender = require('./behaviors/Tidings-ReportRender.js');
		const render = (pDatum, fCallback) =>
		{
			const tmpCallback = (typeof(fCallback) === 'function') ? fCallback : () => { };

			const tmpDatum = (typeof(pDatum) === 'object') ? pDatum : {};

			if (!tmpDatum.hasOwnProperty('TidingsData'))
			{
				tmpDatum.TidingsData = {};
			}

			tmpDatum.TidingsData.GUIDReportDescription = _Fable.getUUID();

			if (!tmpDatum.TidingsData.Type)
			{
				tmpDatum.TidingsData.Type = 'default';
			}

			doReportRender(pDatum, _Fable, tmpCallback);
			return tmpDatum.TidingsData.GUIDReportDescription;
		};

		const doGetReportStatus = require('./behaviors/Tidings-ReportStatus.js');
		const getReportStatus = (pLocationHash, fCallback) =>
		{
			return doGetReportStatus(pLocationHash, _Fable, fCallback);
		};

		// Get the report datum for a report (either rendered or rendering)
		const doGetReportData = require('./behaviors/Tidings-ReportData.js');
		const getReportData = (pLocationHash, fCallback) =>
		{
			return doGetReportData(pLocationHash, _Fable, fCallback);
		};

		const doGetReportFile = require('./behaviors/Tidings-ReportFile.js');
		const getReportFile = (pLocationHash, pFileHash, fCallback) =>
		{
			return doGetReportFile(pLocationHash, pFileHash, _Fable, fCallback);
		};

		const doDeleteReport = require('./behaviors/Tidings-ReportDelete.js');
		const deleteReport = (pLocationHash, fCallback) =>
		{
			return doDeleteReport(pLocationHash, _Fable, fCallback);
		};

		// Create a new Manifest for a new report
		const buildReportManifest = (pDatum) =>
		{
			return libReportManifestManagement.create(pDatum);
		};

		const tmpNewTidingsObject = (
		{
			buildReportManifest: buildReportManifest,

			render: render,

			getReportData: getReportData,
			getReportStatus: getReportStatus,
			getReportFile: getReportFile,

			// TODO: Ask Jason if this should be an endpoint cos uh hmmmm
			deleteReport: deleteReport,

			new: createNew
		});

		const _CommonServices = require('./Tidings-CommonServices.js').new(_Fable);
		/**
		 * Common Services
		 *
		 * @property commonservices
		 * @type object
		 */
		Object.defineProperty(tmpNewTidingsObject, 'commonservices',
			{
				get: () => { return _CommonServices; },
				enumerable: true
			});

		/**
		* In lieu of wiring up common services, wire up tidings which contains common services
		*/
		const wireTidings = (pRequest, pResponse, fNext) =>
		{
 			pRequest.Tidings = tmpNewTidingsObject;
			fNext();
		};

		// The default endpoints
		const _Endpoints = (
		{
			// Start the Report Rendering Asynchronously
			ReportRender: require('./endpoints/Tidings-Endpoint-Render.js'),
			// Start the Report Rendering Synchronously
			ReportRenderSync: require('./endpoints/Tidings-Endpoint-RenderSync.js'),
			// Run the Report Synchronously
			ReportRun: require('./endpoints/Tidings-Endpoint-Run.js'),
			// Get a staged Report File
			ReportFile: require('./endpoints/Tidings-Endpoint-File.js'),
			// Get a staged Report asset file
			ReportAssetFile: require('./endpoints/Tidings-Endpoint-AssetFile.js'),
			// Get the default Report File
			ReportDefaultFile: require('./endpoints/Tidings-Endpoint-DefaultFile.js'),
			// Get a staged Report Common File
			ReportCommonFile: require('./endpoints/Tidings-Endpoint-CommonFile.js'),
			// Get the Report Data
			ReportData: require('./endpoints/Tidings-Endpoint-Data.js'),
			// Get the Report Manifest
			ReportManifest: require('./endpoints/Tidings-Endpoint-Manifest.js')
		});

		/**
		* Wire up routes for the API
		*
		* @method connectRoutes
		* @param {Object} pRestServer The Restify server object to add routes to
		*/
		tmpNewTidingsObject.connectRoutes = (pRestServer) =>
		{
			const tmpReportRoot = (typeof(_Fable.settings.TidingsReportRoot) === 'string') ? _Fable.settings.TidingsReportRoot : '/1.0/Report';

			_Fable.log.trace('Creating report endpoints', {Root:tmpReportRoot});

			pRestServer.post(tmpReportRoot, wireTidings, _Endpoints.ReportRender);
			pRestServer.post(tmpReportRoot + 'Sync', wireTidings, _Endpoints.ReportRenderSync);
			pRestServer.post(tmpReportRoot + '/Run/Wait', wireTidings, _Endpoints.ReportRun);
			pRestServer.get(tmpReportRoot + '/Manifest/:UUID', wireTidings, _Endpoints.ReportManifest);
			pRestServer.get(tmpReportRoot + '/Datum/:UUID', wireTidings, _Endpoints.ReportData);
			pRestServer.get(tmpReportRoot + '/:UUID/Default', wireTidings, _Endpoints.ReportDefaultFile);
			pRestServer.get(tmpReportRoot + '/:UUID/Assets/:FileName', wireTidings, _Endpoints.ReportAssetFile);
			pRestServer.get(tmpReportRoot + '/:UUID/:FileName', wireTidings, _Endpoints.ReportFile);
			pRestServer.get(tmpReportRoot + '/Run/:ReportType/:FileName', wireTidings, _Endpoints.ReportCommonFile);
			pRestServer.get(tmpReportRoot + '/:UUID/:ReportType/:FileName', wireTidings, _Endpoints.ReportCommonFile);
			// This is too inclusive
			const tmpGlobalRegexp = /\/.*/;
			pRestServer.get(tmpGlobalRegexp, wireTidings, _Endpoints.ReportCommonFile);
		};

		let _Orator = false;
		tmpNewTidingsObject.Orator = () =>
		{
			if (!_Orator)
			{
				_Orator = require('orator').new(_Fable.settings);
			}
			// TODO: Ask jason if he thinks the endpoints should be automagically mapped into this
			// _Orator.connectRoutes(_Orator.webServer);
			return _Orator;
		};


		tmpNewTidingsObject.connectOutputRoutes = (pOrator) =>
		{
			const tmpReportRoot = (typeof(_Fable.settings.TidingsReportRoot) === 'string') ? _Fable.settings.TidingsReportRoot + 'Output' : '/1.0/ReportOutput';
			pOrator.addStaticRoute(_Fable.settings.Tidings.ReportOutputFolder, 'index.html', new RegExp(tmpReportRoot + '/.*'), tmpReportRoot);
		};

		tmpNewTidingsObject.connectDefinitionRoutes = (pOrator) =>
		{
			const tmpReportRoot = (typeof(_Fable.settings.TidingsReportRoot) === 'string') ? _Fable.settings.TidingsReportRoot + 'Definition' : '/1.0/ReportDefinition';
			pOrator.addStaticRoute(_Fable.settings.Tidings.ReportDefinitionFolder, 'report_definition.json', new RegExp(tmpReportRoot + '/.*'), tmpReportRoot);
		};

		/**
		 * Endpoints
		 *
		 * @property endpoints
		 * @type object
		 */
		Object.defineProperty(tmpNewTidingsObject, 'endpoints',
			{
				get: () => { return _Endpoints; },
				enumerable: true,
			});


		/**
		 * Libraries
		 *
		 * @property libraries
		 * @type array
		 */
		Object.defineProperty(tmpNewTidingsObject, 'libraries',
			{
				get: () => { return _Libraries; },
				set: (pLibraries) => { _Libraries = pLibraries; },
				enumerable: true,
			});

		// Circular but useful
		tmpNewTidingsObject.fable = _Fable;
		_Fable.Tidings = tmpNewTidingsObject;


		return tmpNewTidingsObject;
	};

	return createNew();
};

module.exports = new Tidings();
