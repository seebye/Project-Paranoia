var PageManager = new function()
{
	var private = {};
	var public = {};

	private.m_aPages = {};

	public.getPageByTabID = function(nTabID)
	{
		var page = null;

		for(var key in private.m_aPages)
		{
			if(private.m_aPages[key].hasTabID(nTabID))
			{
				page = private.m_aPages[key];
				break;
			}
		}

		return page;
	};
	public.getPageByUrl = function(strURL)
	{
		return private.m_aPages[getDomain(strURL)];
	};

	public.getDomainByTabId = function(nTabID)
	{
		var page = public.getPageByTabID(nTabID);
		return page ? page.getDomain() : null;
	};
	public.getIpByTabId = function(nTabID)
	{
		var page = public.getPageByTabID(nTabID);
		return page ? page.getIP() : null;
	};
	public.getIpByUrl = function(strURL)
	{
		var page = private.m_aPages[getDomain(strURL)];
		return page ? page.getIP() : null;
	};
	public.getUserAgentByTabId = function(nTabID)
	{
		var page = public.getPageByTabID(nTabID);
		return page ? page.getUserAgent() : null;
	};
	public.getUserAgentByUrl = function(strURL)
	{
		var page = private.m_aPages[getDomain(strURL)];
		return page ? page.getUserAgent() : null;
	};

	public.registerTab = function(nTabID, strURL)
	{
		var strDomain = getDomain(strURL);
		var page = private.m_aPages[strDomain];

		console.log("registerTab");

		if(!page)
		{
			page = new Page(strDomain);
			private.m_aPages[strDomain] = page;

			console.log("new tab added");
		}

		page.addTabID(nTabID);
		console.log(strURL);
	};

	public.unregisterTab = function(nTabID, strNewUrl)
	{
		var pageNew = public.getPageByUrl(strNewUrl);
		var pageOld = public.getPageByTabID(nTabID);

		console.log("unregisterTab");
		if(pageNew != pageOld
			&& pageOld != null)
		{
			pageOld.removeTabID(nTabID);
			console.log("old tabid from page removed");
			if(pageOld.isEmpty())
			{
				console.log("cookies destroyed");
				// clear cookies, etc.
				if(pageNew == null // =tab closed
					|| pageNew.getDomain() != pageOld.getDomain())//=site changed
				{
					pageOld.destroyCookies();
				}
				delete private.m_aPages[pageOld.getDomain()];
			}
		}
		console.log(strNewUrl);
	};

	public.constructor = function(strDomain)
	{
		chrome.windows.getAll({"populate" : true}, function(windows)
		{
			for(var i = 0, nLen = windows.length; i < nLen; i++)
			{
				for(var j = 0, nLen2 = windows[i].tabs.length; j < nLen2; j++)
				{
					public.registerTab(windows[i].tabs[j].id, windows[i].tabs[j].url);
				}
			}
		});

		public.constructor = undefined;//delete public.constructor;
		return public;
	};

	return public.constructor.apply(public, arguments);
}();