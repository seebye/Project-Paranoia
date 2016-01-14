
// this class should be able to create single level hooks
// -> hooking a hook function shouldn't be possible!
var Hook = new function()
{
	var private = {};
	var public = {};

	// methods which are passed to a callback function to create hooks
	// -> createHookFunction should only be called from a callback (to ensure the correct usage of this class)
	// 	  otherwise the hooks wouldn't be added to e.g. iframes
	var special_accessable = {};

	private.m_aOurHooks = [];


	// methods / functions which adds our hooks to the objects
	private.m_aOurHookCreatorsDocument = [];
	private.m_aOurHookCreatorsWindow = [];

	private.m_protoIFrame = null;

	private.m_cookieIFrame = null;
	private.m_cookieDocument = null;/*contains the unmodified cookie object, everything else will be modified*/

	private.m_objectStorage = null; // used to restore the storage prototype

	private.getCookieDocument = function()
	{
		return private.m_cookieDocument;
	};
	private.getStorage = function()
	{
		return private.m_objectStorage;
	};
	private.init = function()
	{
		public.setupHookDocument(function(createHookFunction, documentObject)
		{
			if(private.m_cookieDocument != documentObject
				&& !Object.getOwnPropertyDescriptor(documentObject, 'cookie'))
			{
				new CookieManager(documentObject, private.getCookieDocument);
			}
		});
		public.setupHookWindow(function(createHookFunction, windowObject)
		{
			if(windowObject.DOMImplementation)
			{
				windowObject.DOMImplementation.prototype.createHTMLDocument = createHookFunction(windowObject.DOMImplementation.prototype.createHTMLDocument, private.createHookHTMLDocumentConstructor);
			}
			else
			{
				windowObject.DOMImplementation = window.DOMImplementation;
			}

			// we have to 'disable' these variables for security reasons
			try
			{
				Object.defineProperty(windowObject.HTMLIFrameElement.prototype, 'contentDocument', {
									get: function()
									{
										var ret = null;
										var bIsCookieIFrame = this == private.m_cookieIFrame;
										var bIsCookieDocumentInited = private.m_cookieDocument != null;

										private.makeIFrameAccessable(this,
											// skip hooking methods if iframe == our cookie iframe and we still need to grap the document
											bIsCookieIFrame && !bIsCookieDocumentInited);
										ret = this.contentDocument;
										private.revokeIFrameAccess(this);

										if(bIsCookieIFrame && bIsCookieDocumentInited)
										{
											// lol no you're not allowed to read all cookies
											ret = document;
										}


										return ret;
									},
									configurable: false,
									enumerable: false,
									set: function(){}
								});
			}
			catch(e){}
			try
			{
				Object.defineProperty(windowObject.HTMLIFrameElement.prototype, 'contentWindow', {
									get: function()
									{
										var ret = null;
										var bIsCookieIFrame = this == private.m_cookieIFrame;
										var bIsCookieDocumentInited = private.m_cookieDocument != null;
										
										private.makeIFrameAccessable(this);
										ret = this.contentWindow;
										private.revokeIFrameAccess(this);

										if(bIsCookieIFrame && bIsCookieDocumentInited)
										{
											// lol no you're not allowed to read all cookies
											ret = window;
										}


										return ret;
									},
									configurable: false,
									enumerable: false,
									set: function(){}
								});
			}
			catch(e){}
		});
	};

	private.createHookHTMLDocumentConstructor =function(create)
	{
		return function() {
			var ret = create ? create.apply(this, arguments) : null;

			private.addDocumentHooks(ret);

			return ret;
		};
	};
	private.createHookGetComputedStyle =function(create)
	{
		var newObj = null;

		return function() {
			var ret = create ? create.apply(this, arguments) : null;

			// protect against data revealing via css
			// e.g. visited sites via ':visited' selector
			if(newObj == null)
			{
				for(var key in ret)
				{
					if(typeof key == 'string')
					{
						var objNewVal = null;

						switch(typeof ret[key])
						{
							case 'string':
								objNewVal = '';
								break;
							case 'number':
								objNewVal = 0;
								break;
							case 'boolean':
								objNewVal = false;
								break;
							case 'function':
								objNewVal = function(){return '0';};
								break;
						}
					}

					try
					{
						Object.defineProperty(ret, key, {
							value: objNewVal,
							configurable: false,
							enumerable: false,
							writable: false
						});
					}
					catch(e){}
				}

				newObj = ret;
			}

			return newObj;
		};
	};

	private.addDocumentHooks = function(documentObject)
	{
		for (var i in private.m_aOurHookCreatorsDocument)
		{
			private.m_aOurHookCreatorsDocument[i](special_accessable.createHookFunction, documentObject);
		}
	};
	// legacy as we decided to give every iframe the same document and window object.. as we know no way to instantly hook every new iframe (innerHTML is a big problem..)// ensure our hooks are present on every document / window object
	private.addMethodsIfNecessary = function(node)
	{
		if(node)
		{
			try
			{
				if(node.contentDocument)
				{
					private.addDocumentHooks(node.contentDocument);
				}
			}
			catch(e)
			{
			}
			try
			{
				if(node.contentWindow)
				{
					for (var i in private.m_aOurHookCreatorsWindow)
					{
						private.m_aOurHookCreatorsWindow[i](special_accessable.createHookFunction, node.contentWindow);
					}

				}
			}
			catch(e)
			{
			}
		}
	};


	private.registerHookFunction = function(func)
	{
		private.m_aOurHooks.push(func);
	};

	public.isHookFunction = function(func)
	{
		return private.m_aOurHooks.indexOf(func) >= 0;
	};

	special_accessable.createHookFunction = function(funcTarget, funcCreateHookFunc)
	{
		var hook = funcTarget;

		// we don't want to hook hook-functions
		if(funcTarget && !public.isHookFunction(hook) && typeof funcCreateHookFunc == 'function')
		{
			hook = funcCreateHookFunc(funcTarget);
			private.registerHookFunction(hook);
		}

		return hook;
	};

	/**
	* callback		A function which adds the hooks to the functions
	*				Two arguments will be passed to the callback
	*				-> function(createHookFunction, documentObject)
	*				{
	*					documentObject.theMethodIwantToBeHooked = createHookFunction(documentObject.theMethodIwantToBeHooked
	*																				, theMethodWhichCreatesTheHookMethod);
	*				}
	*/
	public.setupHookDocument = function(callback)
	{
		private.m_aOurHookCreatorsDocument.push(callback);

		// hook methods for current frame / site
		callback(special_accessable.createHookFunction, document);
	};

	public.setupHookWindow = function(callback)
	{
		private.m_aOurHookCreatorsWindow.push(callback);

		// hook methods for current frame / site
		callback(special_accessable.createHookFunction, window);
	};

	private.setupIFrames = function()
	{
		var iframe = document.createElement('iframe');
		iframe.sandbox = 'allow-same-origin';
		document.documentElement.insertBefore(iframe, document.documentElement.firstChild);
		private.m_protoIFrame = iframe.contentWindow.HTMLIFrameElement.prototype;
		document.documentElement.removeChild(iframe);

		return iframe;
	};

	private.setupIFrameCookie = function()
	{
		var iframe = document.createElement('iframe');
		iframe.sandbox = 'allow-same-origin';
		iframe.setAttribute('style', 'height:1px;width:1px;opacity:0;pointer-events: none;position: absolute;');
		document.documentElement.insertBefore(iframe, document.documentElement.firstChild);
		private.m_cookieIFrame = iframe;
		private.m_cookieDocument = iframe.contentDocument;
		private.m_objectStorage = iframe.localStorage
								? iframe.localStorage
								: iframe.sessionStorage
								? iframe.sessionStorage
								: iframe.globalStorage
								? iframe.globalStorage
								: null;
		//document.documentElement.removeChild(iframe);
	};

	/**
	* If this method returns true you have to ensure
	* that {@link private.revokeIFrameAccess} is called.
	* We need to do this to avoid to allow our enemies to fetch the prototype.
	*/
	private.makeIFrameAccessable = function(node, bSkipAddMet)
	{
		var bRet = false;

		node.__proto__ = private.m_protoIFrame;
		if(!bSkipAddMet)
		{
			private.addMethodsIfNecessary(node);

			if(node.src
				&& (node.src.indexOf('http://') == 0
					|| node.src.indexOf('https://') == 0))
			{
				bRet = true;
			}
		}

		return bRet;
	};

	private.revokeIFrameAccess = function(node)
	{
		node.__proto__ = window.HTMLIFrameElement.prototype;
		//alert('ok: '+(node.__proto__ == window.HTMLIFrameElement.prototype));
	};

	private.eventListenerIFrame = function(e)
	{
		if(e && e.path && e.path.length > 0 && e.path[0])
		{
			if(e.path[0].src.indexOf(':blank') >= 0)
			{
				private.addMethodsIfNecessary(e.path[0]);
			}
			//private.makeIFrameAccessable(e.path[0]);
		}
	};

	public.constructor = function()
	{
		private.setupIFrames();
		private.init();
		private.setupIFrameCookie();

		public.constructor = undefined;//delete public.constructor;
		return public;
	};

	return public.constructor();
}();
