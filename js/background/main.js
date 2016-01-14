/**
TODO: 
- Add localStorage, sessionStorage to sandbox.

*/


function isParamUrl(strUrl)
{
	return strUrl.indexOf(PARAM_URL) >= 0 && strUrl.indexOf(PARAM_URL) == strUrl.length-PARAM_URL.length;
}

chrome.tabs.onCreated.addListener(function(tab)
{
	// create sandbox for new tabs
	PageManager.registerTab(tab.id, tab.url);
});
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo)
{
	// destroy sandbox
	PageManager.unregisterTab(tabId, null);
});

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	sendResponse({userAgent: PageManager.getUserAgentByTabId(sender.tab.id)});
});
chrome.webRequest.onBeforeRequest.addListener
(
    function(details)
    {
		var objectReturn = {};


		if(isParamUrl(details.url))
		{
			// pass data to the injected script

			var paramBuilder = null;
			var page = null;
			var bShouldClear = false;
			paramBuilder = new UrlParameters("<no_longer_needed>");
			page = PageManager.getPageByTabID(details.tabId);

			if(page != null)
			{
				bShouldClear = page.shouldClear(details.tabId);

				paramBuilder.addParam("userAgent", page.getUserAgent());
				paramBuilder.addParam("domain", page.getDomain());
				if(bShouldClear)
				{
					paramBuilder.addParam("shouldClear", "true");
				}

				objectReturn.redirectUrl = PARAM_REDIRECT_URL+'?'+ paramBuilder.getParams();
			}
		}

        return objectReturn;
    },
	{urls: ["<all_urls>"]},
    ["blocking"]
);
chrome.webRequest.onCompleted.addListener
(
    function(details)
    {
    	// currently the localstorage, etc. is cleared on the first visit
    	// -> we need to save that we already cleared it
    	var page = PageManager.getPageByTabID(details.tabId);

		if(page != null)
		{
			page.setCleared(details.tabId);
		}
    },
	{urls: ["<all_urls>"]}
);
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	var objectReturn = {};
	var strHost = getDomain(details.url);
	var strFakeIP = null;
	var strUserAgent = null;
	var strHostMainFrame = null;
	var strPrefix = null;
	var regexPattern = null;


	if(details.type == "main_frame")
	{
		// ip per domain..
		// cookies per domain (also for third party domains) (or block thirth party cookies)
		// for the main_frame (=html of the page) -> fetch the ip by the url
		// also check whether we moved to another domain
		PageManager.unregisterTab(details.tabId, details.url);
		PageManager.registerTab(details.tabId, details.url);

		strFakeIP = PageManager.getIpByUrl(details.url);
		strUserAgent = PageManager.getUserAgentByUrl(details.url);
		strHostMainFrame = strHost;
	}
	else
	{
		// request for a stylesheet, script or something else..
		// look for the ip we used for the main frame
		strFakeIP = PageManager.getIpByTabId(details.tabId);
		strUserAgent = PageManager.getUserAgentByTabId(details.tabId);
		strHostMainFrame = PageManager.getDomainByTabId(details.tabId);
	}

	strPrefix = getDomainPrefix(strHostMainFrame ? strHostMainFrame : "");
	regexPattern = new RegExp(strPrefix, "g");

	for (var i = 0, nLen = details.requestHeaders.length; i < nLen; i++)
	{
		if(details.requestHeaders[i]
			&& details.requestHeaders[i].name)
		{
			switch(details.requestHeaders[i].name.toLowerCase())
			{
				case "user-agent":
					if(strUserAgent) {
						details.requestHeaders[i].value = strUserAgent;
					}
					break;
				case "referer":
					if(strHost != getDomain(details.requestHeaders[i].value)) {
						details.requestHeaders.remove(i);
					}
					break;
				case "cookie":
					var astrCookies = details.requestHeaders[i].value.split(";");
					var strCookies = "";

					for(var key in astrCookies)
					{
						if(typeof astrCookies[key] == "string"
							&& astrCookies[key].trim().indexOf(strPrefix) == 0)
						{
							if(strCookies.length != 0)
							{
								strCookies += ";";
							}
							strCookies += astrCookies[key];
						}
					}
					details.requestHeaders[i].value = /*details.requestHeaders[i].value*/strCookies.replace(regexPattern, "");
					break;


// remove cache 'ids'
/*
case "etag":
case "expires":
case "last-modified":*/
				case "if-modified-since":
				case "if-none-match":
					details.requestHeaders.remove(i);
					break;
				case "accept-language":
					details.requestHeaders[i].value = "en-US,en;q=0.5";
					break;
				case "cache-control":
				//case "pragma":
					details.requestHeaders[i].value = "no-cache, no-store";
					break;
			}
		}
	}

	if(strFakeIP)
	{
		details.requestHeaders.push({name: "X-Forwarded-For", value: strFakeIP});
	}

	objectReturn.requestHeaders = details.requestHeaders;

	return objectReturn;
},
{urls: ["<all_urls>"]},
["requestHeaders", "blocking"]);

chrome.webRequest.onHeadersReceived.addListener(function(details) {

	var objectReturn = {};
	var strHost = getDomain(details.url);
	var strPrefix = null;
	

	if(details.type == "main_frame")
	{
		// ip per domain..
		// cookies per domain (also for third party domains) (or block thirth party cookies)
		// for the main_frame (=html of the page) -> fetch the ip by the url
		// also check whether we moved to another domain
		strHostMainFrame = strHost;
	}
	else
	{
		// request for a stylesheet, script or something else..
		// look for the ip we used for the main frame
		strHostMainFrame = PageManager.getDomainByTabId(details.tabId);
	}

	strPrefix = getDomainPrefix(strHostMainFrame ? strHostMainFrame : "");

	for (var i = 0, nLen = details.responseHeaders.length; i < nLen; i++)
	{
		if(details.responseHeaders[i]
			&& details.responseHeaders[i].name)
		{
			switch(details.responseHeaders[i].name.toLowerCase())
			{
				case "set-cookie":
					var nPos = details.responseHeaders[i].value.indexOf("=");

					if(nPos > 0)
					{

						details.responseHeaders[i].value = 
							// before first "="
							strPrefix
							+details.responseHeaders[i].value.substring(0, nPos).trim()
							// after first "="
							+details.responseHeaders[i].value.substring(nPos);
					//		console.log("after "+details.responseHeaders[i].value);

					}
					break;
			}
		}
	}

	objectReturn.responseHeaders = details.responseHeaders;

	return objectReturn;
},
{urls: ["<all_urls>"]},
["responseHeaders", "blocking"]);