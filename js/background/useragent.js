var UserAgent = new function()
{
	var USERAGENTS = "useragents";
	var USERAGENTS_TS = "useragents_timestamp";
	var private = {};
	var public = {};

	private.m_astrUserAgents = [];
	private.m_lTimestamp = 0;

	private.fetchUserAgents = function()
	{
		private.m_lTimestamp = timestamp(); // avoid multiple requests

		var req = new XMLHttpRequest();
		req.open("GET", "https://techblog.willshouse.com/2012/01/03/most-common-user-agents/", false);
		req.send();


		if(4 == req.readyState
			&& 200 == req.status)
		{
			var div = document.createElement("div");
			div.innerHTML = req.responseText;
			try
			{
				var astrUA = div.getElementsByTagName("textarea")[0].innerHTML.split("\n");
				astrUA = astrUA.slice(0, Math.min(10, astrUA.length));

				var data = {};
				data[USERAGENTS] = private.m_astrUserAgents = astrUA;
				data[USERAGENTS_TS] = private.m_lTimestamp = timestamp();
				chrome.storage.local.set(data);
			}
			catch(e){}
		}
		else
		{
			private.m_lTimestamp = 0; // retry
		}
	};

	public.getRandomUserAgent = function()
	{
		if(private.m_lTimestamp + 7*24*60*60*1000 < timestamp())
		{
			private.fetchUserAgents();
		}

		return private.m_astrUserAgents[getRand(0, private.m_astrUserAgents.length-1)];
	};

	public.constructor = function()
	{
		chrome.storage.local.get([USERAGENTS, USERAGENTS_TS], function(items)
		{
			for(var key in items)
			{
				switch(key)
				{
					case USERAGENTS:
						private.m_astrUserAgents = items[key];
						break;
					case USERAGENTS_TS:
						private.m_lTimestamp = items[key];
						break;
				}
			}
		});

		public.constructor = undefined;//delete public.constructor;
		return public;
	};

	return public.constructor.apply(public, arguments);
}();