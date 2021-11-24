// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

// This code is built to provide feedback on where a template might be failing.
// File link: https://github.com/jashkenas/underscore/blob/5fe7576173dd9c1c8b70f5b7826901dcbc508b3a/underscore.js
//
// TODO: Make this a browserify/npm module?

module.exports = (pTemplateString) =>
{
	const tmpValidationResult =
	{
		Enclosures:
		{
			Type: 'Expression',
			Left: /\<\%/g,
			LeftCount: 0,
			Right: /\%\>/g,
			RightCount: 0,
		},
		CodePositions: {},
		Warnings: [],
	};
	const tmpEnclosures = tmpValidationResult.Enclosures;

	let pMatch = false;
	while ((pMatch = tmpEnclosures.Left.exec(pTemplateString)) != null)
	{
		tmpValidationResult.CodePositions[pMatch.index] = 'Left';
		tmpEnclosures.LeftCount++;
	}
	while ((pMatch = tmpEnclosures.Right.exec(pTemplateString)) != null)
	{
		tmpValidationResult.CodePositions[pMatch.index] = 'Right';
		tmpEnclosures.RightCount++;
	}

	// Now match enclosure counts and ensure there is balance
	tmpValidationResult.EnclosureBalance = (tmpEnclosures.RightCount - tmpEnclosures.LeftCount);

	if (tmpValidationResult.EnclosureBalance != 0)
	{
		tmpValidationResult.Warnings.push('Enclosures out of balance!  This will almost definitely break your template.');
	}

	// Walk through the enclosure list and see if we have two of either type right next to each other or other problems
	let tmpLastDemarc = false;
	for (let tmpDemarcString in tmpValidationResult.CodePositions)
	{
		// Yay for javascript object names being strings
		const tmpDemarc = parseInt(tmpDemarcString);
		// Two next to each other should never match
		if (tmpValidationResult.CodePositions[tmpDemarc] == tmpValidationResult.CodePositions[tmpLastDemarc])
		{
			tmpValidationResult.Warnings.push('Enclosure at character ' + tmpLastDemarc + ' (ending at ' + tmpDemarc + ') not properly balanced!');
			if (tmpDemarc - tmpLastDemarc < 150)
			{
				let tmpEnd = tmpDemarc;
				if (pTemplateString.length >= tmpEnd + 2)
					tmpEnd += 2;
				tmpValidationResult.Warnings.push('Code between ' + tmpLastDemarc + ' and ' + tmpEnd + ': ' + pTemplateString.substring(tmpLastDemarc, tmpEnd));
			}
		}

		if (!tmpLastDemarc && (tmpValidationResult.CodePositions[tmpDemarc] == 'Right'))
		{
			tmpValidationResult.Warnings.push('Enclosure at character ' + tmpLastDemarc + ' is a closing bracket but this is the first one in the template!');
		}
		tmpLastDemarc = tmpDemarc;
	}

	return tmpValidationResult;
};
