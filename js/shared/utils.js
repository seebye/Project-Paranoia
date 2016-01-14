// for content, background, injection
/*unused
function constant(strKey, objectValue)
{
	Object.defineProperty(window, strKey,
	{
		value: objectValue,
		configurable: false,
		enumerable: false,
		writable: false
	});
}*/

// ts in ms
function timestamp()
{
	return new Date().getTime();
}

function getDomainPrefix(strMainFrameDomain)
{
	return 'paranoia'+strMainFrameDomain.replace(/[^a-z0-9]/gi, '');
}

function getDomain(strURL)
{
	var match = strURL 
				? strURL.match(/(?:(?:https?|s?ftps?|chrome|about):\/\/)([^\/\:]+)/i) // /(?:(?:https?|s?ftps?|chrome|about):\/\/)(?:[^\.]+\.){0,1}([^\.\/\:]+\.[^\/\.\:]+)/i) ///(?:(?:https?|s?ftps?|chrome|about):\/\/)([^\/]+)/i)
				: null;

	var strDomain =  match
				? match[1]
				: '';

	// convert subdomain to tld
	strDomain = strDomain.substring(1+strDomain.lastIndexOf('.', strDomain.lastIndexOf('.')-1));
	var strGroup = GROUPS[strDomain] ? GROUPS[strDomain] : strDomain;
	return strGroup;
}
