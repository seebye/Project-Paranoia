var CookieManager = function()
{
	var private = {};
	var public = {};

	private.getDomain = function()
	{
		return Parameters.getDomain();
	};
	private.getDomainPrefix = function()
	{
		return getDomainPrefix(private.getDomain());
	};
	private.getRegexDomainPrefix = function()
	{
		return new RegExp(private.getDomainPrefix(), 'g');
	};


	public.constructor = function(objectDocument, getterCookieDocument)
	{
		Object.defineProperty(objectDocument, 'cookie', {
							get: function()
							{
								var strRet = '';
								var astrTmpCookies = getterCookieDocument().cookie.split(';');

								for(var i = 0, nLen = astrTmpCookies.length
									; i < nLen
										&& private.getDomain() // return no data if we haven't received the data
									; i++)
								{
									var astrData = astrTmpCookies[i].split('=');
									if(astrData[0].trim().indexOf(private.getDomainPrefix()) == 0)
									{
										if(strRet.length != 0)
										{
											strRet += ';';
										}

										strRet += astrTmpCookies[i];
									}
								}

								if(private.getDomain())
								{
									strRet = strRet.replace(private.getRegexDomainPrefix(), '');
								}

								return strRet;
							},
							configurable: false,
							enumerable: false,
							set: function(strCookies)
							{
								if(strCookies
									&& private.getDomain())
								{
									var astrCookies = strCookies.split(';');

									for(var i = 0, nLen = astrCookies.length
										; i < nLen
										; i++)
									{
										var strCookie = astrCookies[i].trim();
										var nPos = strCookie.indexOf('=');
										if(nPos >= 0)
										{
											strCookie = 
												// before first '='
												private.getDomainPrefix()
												+strCookie.substring(0, nPos).replace(/[ \t]*/g, '')
												// after first '='
												+strCookie.substring(nPos);
										}
										else
										{
											strCookie = private.getDomainPrefix() + strCookie;
										}

										getterCookieDocument().cookie = strCookie;
									}
								}
							}
						});
	};

	return public.constructor.apply(public, arguments);
};