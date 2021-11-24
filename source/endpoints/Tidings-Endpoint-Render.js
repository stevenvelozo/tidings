/**
* Get the Report Datum
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
/**
* Get the Datum for a particular report
*/
module.exports = (pRequest, pResponse, fNext) =>
{
	pRequest.Datum = pRequest.body;

	if (typeof(pRequest.Datum) !== 'object')
	{
		// Invalid Datum
		return pRequest.Tidings.commonservices.sendCodedError('Error Rendering Report: invalid Datum', {}, pRequest, pResponse, fNext);
	}

	pRequest.Tidings.commonservices.log.info('Starting to render a report');
	const tmpReportGUID = pRequest.Tidings.render(pRequest.Datum,
		(pError) =>
		{
			if (pError)
			{
				pRequest.Tidings.commonservices.fable.log.error('Error Rendering Report: ' + pError, {}, pRequest, pResponse, fNext);
			}
		});
	pRequest.Tidings.commonservices.log.info('...beginning rendering of report GUID ' + tmpReportGUID);
	pResponse.send({GUIDReportDescription:tmpReportGUID});
	return fNext();
};
