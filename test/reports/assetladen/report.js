/* The Nyan Report */

// This function parses the downloaded html asset, pulls out a list of links (literally 'a' elements) and builds a list for our report to use
var parseNeverWorkInTheory = (pState, fCallback) =>
{
	pState.Behaviors.loadReportFile(pState, 'Asset', 'NeverWorkInTheory.html',
		function(pError, pData)
		{
			// Stuff the callback in a variable
			var tmpCallback = fCallback;
	
			// Now parse the html asset with Cheerio
			var tmpDom = pState.Tidings.libraries.Cheerio.load(pData);
	
			// Get all the links (jquery style)
			var tmpLinks = tmpDom('a');
			
			// Create a JSON file in the scratch area for the report to use.
			var tmpLinkList = [];
	
			pState.Libraries.Async.eachSeries(tmpLinks,
				(pLink, fStageComplete)=>
				{
					var tmpLinkText = tmpDom(pLink).text().trim();
					if (tmpLinkText != '')
						tmpLinkList.push(tmpLinkText);
					fStageComplete();
				},
				(pError)=>
				{
					// Store it in the state scratch area (for use internally)
					pState.Scratch.Links = tmpLinkList;
					// Save it to a scratch file (for processing by external tools, etc.)
					pState.Behaviors.saveReportFile(pState, JSON.stringify(tmpLinkList,null,4), 'Scratch', 'Links.json',
						(pError)=>
						{
							// This report definition could error handle here
							tmpCallback(false, pState);
						});
				});
		});
};

// This function parses the downloaded zip codes file and builds a list of relevant locations for the report to use.
var parseZipCodes = (pState, fCallback) =>
{
	// The data looks like this:
	// {"postalcodes":[{"adminCode2":"033","adminCode1":"WA","adminName2":"King County","lng":-122.302236,"countryCode":"US","postalcode":"98105","adminName1":"Washington","placeName":"Seattle","lat":47.663266},...
	pState.Behaviors.loadReportFile(pState, 'Asset', 'ZipCodes.json',
		function(pError, pData)
		{
			var tmpLocations = [];
			
			// Parse the data we downloaded
			var tmpZipCodes = JSON.parse(pData);
			
			if ((typeof(tmpZipCodes) !== 'object') || !tmpZipCodes.hasOwnProperty('postalcodes') || tmpZipCodes.postalcodes.length < 1)
			{
				pState.Scratch.Locations = tmpLocations;
				return fCallback(null, pState);
			}

			for (var i = 0; i < tmpZipCodes.postalcodes.length; i++)
			{
				tmpLocations.push(
					{
						Country: tmpZipCodes.postalcodes[i].countryCode,
						State: tmpZipCodes.postalcodes[i].adminCode1,
						Zip: tmpZipCodes.postalcodes[i].postalcode,
						County: tmpZipCodes.postalcodes[i].adminCode2,
						City: tmpZipCodes.postalcodes[i].placeName,
						Latitude: tmpZipCodes.postalcodes[i].lat,
						Longitude: tmpZipCodes.postalcodes[i].lng
					});
			}

			// Store it in the state scratch area (for use internally)
			pState.Scratch.Locations = tmpLocations;
			// Unlike the previous function we are not saving this to a scratch file -- there is no need.
			return fCallback(null, pState);
		});
};

module.exports = (
{
	preCollect: (pState, fCallback) =>
	{
		// Check that the Datum contains our data
		// TODO: Ask Jason if this should be its own phase
		// Also if there should be a macro function to do this for example: pState.Behaviors.CheckDatum(pState, 'ZipCode', '98105') or something similar
		if (!pState.Datum.hasOwnProperty('Name'))
			pState.Datum.Name = 'J(ane|ohn) Doe';
		if (!pState.Datum.hasOwnProperty('ZipCode'))
			pState.Datum.ZipCode = '98105';
		if (!pState.Datum.hasOwnProperty('Country'))
			pState.Datum.Country = 'US';

		// Add a couple things to the download list
		pState.Manifest.AssetCollectionList.push({URL:'http://api.geonames.org/postalCodeLookupJSON?postalcode='+pState.Datum.ZipCode+'&country='+pState.Datum.Country+'&username=tidings',File:'ZipCodes.json'});
		pState.Manifest.AssetCollectionList.push({URL:'http://neverworkintheory.org/',File:'NeverWorkInTheory.html'});
		fCallback(false, pState);
	},

	calculate: (pState, fCallback) =>
	{
		// This should be an async.waterfall but meh
		parseNeverWorkInTheory(pState, 
			(pError, pState) =>
			{
				parseZipCodes(pState, fCallback);
			});
	},

	rasterize: (pState, fCallback) =>
	{
		pState.Behaviors.stateLog(pState, 'This is really rasterizey...');
		fCallback(false, pState);
	}
});