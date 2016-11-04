module.exports = (
{
	rasterize: (pState, fCallback) =>
	{
		pState.Behaviors.stateLog(pState, 'This is really rasterizey...');
		fCallback(false, pState);
	}
});