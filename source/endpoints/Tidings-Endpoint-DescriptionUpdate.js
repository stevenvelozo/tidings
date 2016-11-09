/**
* Post updates to a Report Description
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Tidings
*/
/**
* Update a Report Description (some files, description, templates, etc.)
*/
module.exports = (pRequest, pResponse, fNext) =>
{
	pRequest.Description = pRequest.body;
	
	if (typeof(pRequest.Description) !== 'object')
		// Invalid Description
		return pRequest.Tidings.commonservices.sendCodedError('Error Updating Report Description: Invalid Description Passed In', {}, pRequest, pResponse, fNext);

	if (!pRequest.Description.Type)
		// Invalid Report Type
		return pRequest.Tidings.commonservices.sendCodedError('Error Updating Report Description: Invalid Type in Description', {}, pRequest, pResponse, fNext);

	pRequest.Tidings.commonservices.log.info('Starting to Update a Report Description');
    pRequest.Tidings.updateDescription(pRequest.Description,
		(pError, pDescription)=>
		{
			if (pError)
				return pRequest.Tidings.commonservices.fable.log.error('Error Updating Report Description: '+pError, {}, pRequest, pResponse, fNext);
        
        	pResponse.send({ReportType:pDescription.Type});
        	return fNext();
		});
};
