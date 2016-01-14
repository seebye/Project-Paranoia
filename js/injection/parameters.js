var Parameters = new function()
{
	var private = {};
	var public = {};

	private.m_mapParams = {};
	private.m_bLoaded = false;
	private.m_aCallbacks = [];

	public.getPlatfrom = function() {
		var strUserAgent = public.getUserAgent();
		var strPlatform = '';

		if(strUserAgent)
		{
			if(strUserAgent.toLowerCase().indexOf('linux') >= 0)
			{
				strPlatform = 'Linux x86_64';
			}
			else if(strUserAgent.toLowerCase().indexOf('windows') >= 0)
			{
				strPlatform = 'Win32';
			}
			else if(strUserAgent.toLowerCase().indexOf('mac') >= 0
						&& strUserAgent.toLowerCase().indexOf('intel') >= 0)
			{
				strPlatform = 'MacIntel';
			}
			else if(strUserAgent.toLowerCase().indexOf('mac') >= 0
						&& strUserAgent.toLowerCase().indexOf('68k') >= 0)
			{
				strPlatform = 'Mac68K';
			}
			else if(strUserAgent.toLowerCase().indexOf('mac') >= 0
						&& strUserAgent.toLowerCase().indexOf('powerpc') >= 0)
			{
				strPlatform = 'MacPPC';
			}
		}
		return strPlatform;
	};

	public.isFirefox = function() {
		return public.getUserAgent().toLowerCase().indexOf('firefox') >= 0;
	};

	public.getAppNameCode = function() {
		var strAppName = public.getUserAgent();
		return strAppName.length > 0 ? strAppName.substring(0, strAppName.indexOf('/')) : '';
	};

	public.getAppVersion = function() {
		var strAppName = public.getUserAgent();
		return strAppName.length > 0 ? strAppName.substring(strAppName.indexOf('/')+1) : '';
	};

	public.getUserAgent = function() {
		return private.m_mapParams['userAgent'] ? private.m_mapParams['userAgent'] : '';
	};

	public.shouldClear = function() {
		return private.m_mapParams['shouldClear'] == 'true';
	};
	
	public.getDomain = function() {
		return private.m_mapParams['domain'];
	};

	public.onLoaded = function(callback) {
		if(private.m_bLoaded)
		{
			callback();
		}
		else
		{
			private.m_aCallbacks.push(callback);
		}
	};

	private.updateData = function(strHash) {

		if(strHash != null)
		{
			var astrParams = strHash.split('&');

			for(var key in astrParams)
			{
				var astrKeyValue = astrParams[key].split('=');
				private.m_mapParams[astrKeyValue[0]] = decodeURIComponent(astrKeyValue[1]);
			}
		}
	};

	private.executePendingCallbacks = function() {
		private.m_bLoaded = true;

		for(var key in private.m_aCallbacks)
		{
			private.m_aCallbacks[key]();
		}

		private.m_aCallbacks = [];
	};

	private.load = function()
	{
		try
		{
			var req = new XMLHttpRequest();
			req.open('GET', window.location+PARAM_URL);//+'/nonsense-yay-more-words-okay/getparams');//
			
			req.onreadystatechange = function() {
				if(4 == req.readyState
					/*404 will likly be returned.. && 200 == req.status*/)
				{console.log('url: '+req.responseURL);
					private.updateData(req.responseURL.split('?')[1]);//req.getResponseHeader('paranoia'));
					private.executePendingCallbacks();
				}
			};
			req.send();
		}
		catch(e)
		{
			// avoid to display 404-error
		}
	};

	public.constructor = function() {
		private.load();

		public.constructor = undefined;//delete public.constructor;
		return public;
	};

	return public.constructor();
}();