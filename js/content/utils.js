function injectScript(strLocation)
{
	var s = document.createElement("script");
	s.async = false;
	s.src = strLocation;
	document.documentElement.insertBefore(s, document.documentElement.firstChild);
}
function inject(strCode)
{
	var s = document.createElement("script");
	s.setAttribute('id', 'paranoia');
	s.async = false;
	s.innerHTML = 

	// use local variables / invisible variables
	"(function(){"
	+strCode

	// clean up
	+"var script = document.getElementById('paranoia');"
	+"script.parentElement.removeChild(script);"
	+"})();";
	document.documentElement.insertBefore(s, document.documentElement.firstChild);
}
/*
function InlineScripts()
{
	var public = {};
	var private = {};

	private.m_aResponse = [];

	private.isCompleted = function()
	{
		var bCompleted = true;

		for(var key in private.m_aResponse)
		{
			bCompleted = bCompleted && private.m_aResponse[key] != null;
		}

		return bCompleted;
	};

	private.inject = function()
	{
		var strCode = "";
		for(var key in private.m_aResponse)
		{
			strCode += private.m_aResponse[key];
		}

		var s = document.createElement("script");
		s.async = false;
		s.innerHTML = strCode;
		document.documentElement.insertBefore(s, document.documentElement.firstChild);
	};

	private.fetchScript = function(Url)
	{
		(function(Url)
		{
			var req = new XMLHttpRequest();
			req.open("GET", Url, true);
			req.send();

			req.onreadystatechange = function()
			{
				if(4 == req.readyState
					&& 200 == req.status)
				{
					private.m_aResponse[Url] = req.responseText;

					if(private.isCompleted())
					{
						private.inject();
					}
				}
			};
		})(Url);
	};

	public.constructor = function(Urls)
	{
		for(var key in Urls)
		{
			private.m_aResponse[Urls[key]] = null;
		}
		for(var key in Urls)
		{
			private.fetchScript(Urls[key]);
		}

		delete public.constructor;
		return public;
	};

	return public.constructor.apply(public, arguments);
}*/

function injectMeta(strHttpEquiv, strContent)
{
	var meta = document.createElement('meta');
	meta.httpEquiv = strHttpEquiv;
	meta.content = strContent;
	meta.paranoia = true;
	document.head.insertBefore(meta, document.head.firstChild);
}