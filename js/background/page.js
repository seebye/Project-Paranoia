var Page = function()
{
	var private = {};
	var public = {};

	private.m_strDomain = null;
	private.m_strIP = null;
	private.m_anTabIDs = [];
	private.m_strUserAgent = null;

	private.m_astrThirdPartyDomains = [];

	/**
	* The tab id of the tab in which we want
	* to clean the localStorage and sessionStorage.
	* 0 if we still need to clear the storages
	*/
	private.m_nTabIDClear = 0;
	private.m_bCleared = false;

	public.getUserAgent = function()
	{
		return private.m_strUserAgent;
	};

	public.getDomain = function()
	{
		return private.m_strDomain;
	};

	public.getIP = function()
	{
		return private.m_strIP;
	};

	public.addTabID = function(nID)
	{
		if(!public.hasTabID(nID))
		{
			private.m_anTabIDs.push(nID);
		}
	};

	public.setCleared = function(nTabID) {
		if(nTabID == private.m_nTabIDClear)
		{
			private.m_bCleared = true;
			private.m_nTabIDClear = Math.pow(-2, 31) +1;
		}
	};

	public.shouldClear = function(nTabID) {
		var nTmpTabID = private.m_nTabIDClear;
		var bRet = !private.m_bCleared
					&& (private.m_nTabIDClear == 0
						|| private.m_nTabIDClear == nTabID);

		if(bRet
			&& (nTmpTabID != private.m_nTabIDClear
				|| private.m_nTabIDClear == 0))
		{
			private.m_nTabIDClear = nTabID;
		}

		return bRet;
	};

	public.addThirdPartyDomain = function(strUrl)
	{
		strUrl = strUrl ? strUrl : "";
		var strDomain = getDomain(strUrl);

		if(!private.isThirdPartyDomain(strDomain))
		{
			private.m_astrThirdPartyDomains.push(strDomain);
		}
	};

	public.hasTabID = function(nID)
	{
		return private.m_anTabIDs.indexOf(nID) >= 0;
	};

	public.getTabsSize = function()
	{
		return private.m_anTabIDs.length;
	};

	public.isEmpty = function()
	{
		return private.m_anTabIDs.length <= 0;
	};

	public.removeTabID = function(nID)
	{
		private.m_anTabIDs.removeValue(nID);
	};


	private.isThirdPartyDomain = function(strDomain)
	{
		return private.m_astrThirdPartyDomains.indexOf(strDomain) >= 0;
	};

	public.destroyCookies = function()
	{
		var strPrefix = getDomainPrefix(private.m_strDomain);
		var strEmptyPrefix = getDomainPrefix('');

		chrome.cookies.getAll({}, function(cookies)
		{
			for(var key in cookies)
			{
				if(strPrefix != strEmptyPrefix
					&& (cookies[key].name.indexOf(strPrefix) == 0
						|| cookies[key].name.indexOf(strEmptyPrefix) != 0))
				{
					chrome.cookies.remove({url: "http://"+cookies[key].domain+cookies[key].path
										, name: cookies[key].name});
					chrome.cookies.remove({url: "https://"+cookies[key].domain+cookies[key].path
										, name: cookies[key].name});
				}
			}
		});
	};

	public.setCookie = function(strCookie)
	{
		chrome.cookies.set({url: "http://"+private.m_strDomain+"/"
							, name: "paranoia"
							, value: strCookie});
		chrome.cookies.set({url: "https://"+private.m_strDomain+"/"
							, name: "paranoia"
							, value: strCookie});
	};

	public.constructor = function(strDomain)
	{
		private.m_strDomain = strDomain;
		private.m_strIP = generateIP();
		private.m_strUserAgent = UserAgent.getRandomUserAgent();
		public.destroyCookies();

		public.constructor = undefined;//delete public.constructor;
		return public;
	};

	return public.constructor.apply(public, arguments);
};