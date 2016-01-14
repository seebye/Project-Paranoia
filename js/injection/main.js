
var globStor = window.globalStorage;
var locStor = window.localStorage;
var sessStor = window.sessionStorage;

function createFakeStorage(strStorageName) {
	if(window[strStorageName])
	{
		Object.defineProperty(window, strStorageName, {
			value: {length: 0,key:function(){return null},getItem:function(){return null},setItem:function(){},removeItem:function(){},clear:function(){}},
			configurable: true,
			enumerable: false,
			writable: false
		});
	}
}
function restoreStorage(strStorageName, objectBackup) {
	if(window[strStorageName]
		&& objectBackup)
	{
		Object.defineProperty(window, strStorageName, {
			value: objectBackup,
			configurable: true,
			enumerable: false,
			writable: false
		});
	}
}
createFakeStorage('globalStorage');
createFakeStorage('localStorage');
createFakeStorage('sessionStorage');
Parameters.onLoaded(function()
{
	if(Parameters.shouldClear())
	{
		// todo add these storages to our sandbox
		clearStorage(globStor, getDomainPrefix(Parameters.getDomain()));
		clearStorage(locStor, getDomainPrefix(Parameters.getDomain()));
		clearStorage(sessStor, getDomainPrefix(Parameters.getDomain()));
	//	clearCache(window.caches, getDomainPrefix(Parameters.getDomain()));

		// reset window.name
		window.name = '';
	}

	restoreStorage('globalStorage', globStor);
	restoreStorage('localStorage', locStor);
	restoreStorage('sessionStorage', sessStor);

/*
	Hook.setupHookWindow(function(createHookFunction, windowObject)
	{
		Object.defineProperty(windowObject.localStorage.prototype, '', {
			value: {length: 0,key:function(){return null},getItem:function(){return null},setItem:function(){},removeItem:function(){},clear:function(){}},
			configurable: true,
			enumerable: false,
			writable: false
		});
	});*/
});


var drawRandomThings = function(ctx, width, height)
{
	var nSidePadding = width > 0 ? 1 : 0;
	var nBottomPadding = height > 0 ? 1 : 0;

	/*
	* Um kaum bemerkbare Punkte hinzuschmieren
	*/
	var nLeft = rand(0, width - nSidePadding);
	var nWidth = 1;
	var nTop = rand(0, height - nBottomPadding);
	var nHeight = 1;

	var nRed = rand(0, 255);
	var nGreen = rand(0, 255);
	var nBlue = rand(0, 255);
	var fAlpha = randfloat(0.01, .2);
	var strRandColor = 'rgba('+nRed+', '+nGreen+', '+nBlue+', '+fAlpha+')';


	ctx.fillStyle = strRandColor;
	ctx.fillRect(nLeft, nTop, nWidth, nHeight);
};

var createHookGetContext =function(real_function)
{
	return function()
	{
		var ret = real_function.apply(this, arguments);

		var nMaxLoops = (this.width * this.height)/500;
		var nLoops = rand(1, Math.max(1, nMaxLoops));
		for(var i = 0; i < nLoops; i++)
		{
			drawRandomThings(ret, this.width, this.height);
		}

		return ret;
	};
};
var createHookToDataURL =function(real_function)
{
	return function()
	{
		this.getContext('2d');

		return real_function.apply(this, arguments);
	};
};


// protection against canvas fingerprinting
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	if(windowObject.HTMLCanvasElement)
	{
		windowObject.HTMLCanvasElement.prototype.getContext = createHookFunction(windowObject.HTMLCanvasElement.prototype.getContext, createHookGetContext);
		windowObject.HTMLCanvasElement.prototype.toDataURL = createHookFunction(windowObject.HTMLCanvasElement.prototype.toDataURL, createHookToDataURL);
	}
	else
	{
		windowObject.HTMLCanvasElement = window.HTMLCanvasElement;
	}
});

// hide browser plugins
Hook.setupHookDocument(function(createHookFunction, documentObject)
{
	try
	{
		Object.defineProperty(documentObject, 'plugins', {
			value: [],
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
});
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	try
	{
		Object.defineProperty(windowObject.navigator, 'plugins', {
			value: {length:0,item:function(){return null;},namedItem:function(){return null;},refresh:function(){}},
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'mimeTypes', {
			value: [],
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
});





// according to http://ip-check.info/ we should swap window.name with a constant
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	/* this breaks many sites... like disqus....
	try
	{
		Object.defineProperty(windowObject, 'name', {
							get: function()
							{
								var strRet = '';

								if(this.strTmpName)
								{
									strRet = this.strTmpName;
								}

								return strRet;
							},
							configurable: false,
							enumerable: false,
							set: function(strNew)
							{
								this.strTmpName = strNew;
							}
						});
	}
	catch(e){}*/
});
// make font detection more difficult - it's still possible...
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	try
	{
		Object.defineProperty(windowObject.CSSStyleDeclaration.prototype, 'fontFamily', {
							get: function(){return '';},
							configurable: false,
							enumerable: false,
							set: function(){}
						});
	}
	catch(e){}
});

// change the browser language to english - most common browser language
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	try
	{
		Object.defineProperty(windowObject.navigator, 'language', {
			value: 'en',
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'languages', {
			value: undefined,
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
});

// hide the tab history
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	try
	{
		Object.defineProperty(windowObject.history, 'length', {
			value: 0,//{back:function(){},go:function(){},forward:function(){},replaceState:function(){},state:0,pushState:function(){}, length:0},
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
});

// block attacks like determine the browser history though ':visited' css
// this may break a page..
//e.g. phpMyAdmin......
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	//windowObject.getComputedStyle = createHookFunction(windowObject.getComputedStyle, private.createHookGetComputedStyle);
});






// block webrtc
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	// webrtc block
	try
	{
		Object.defineProperty(windowObject, 'RTCPeerConnection', {
				value: undefined,
				configurable: false,
				enumerable: false,
				writable: false
			});
	}
	catch(e){}
	try
	{

		Object.defineProperty(windowObject, 'webkitRTCPeerConnection', {
				value: undefined,
				configurable: false,
				enumerable: false,
				writable: false
			});
	}
	catch(e){}
	try
	{

		Object.defineProperty(windowObject.navigator, 'getUserMedia', {
				value: undefined,
				configurable: false,
				enumerable: false,
				writable: false
			});
	}
	catch(e){}
	try
	{

		Object.defineProperty(windowObject.navigator, 'webkitGetUserMedia', {
				value: undefined,
				configurable: false,
				enumerable: false,
				writable: false
			});
	}
	catch(e){}
	try
	{

		Object.defineProperty(windowObject, 'RTCSessionDescription', {
				value: undefined,
				configurable: false,
				enumerable: false,
				writable: false
			});
	}
	catch(e){}
	try
	{

		Object.defineProperty(windowObject, 'webkitRTCSessionDescription', {
				value: undefined,
				configurable: false,
				enumerable: false,
				writable: false
			});
	}
	catch(e){}
	try
	{

		Object.defineProperty(windowObject, 'MediaStreamTrack', {
				value: undefined,
				configurable: false,
				enumerable: false,
				writable: false
			});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject, 'webkitMediaStreamTrack', {
				value: undefined,
				configurable: false,
				enumerable: false,
				writable: false
			});
	}
	catch(e){}
	// ende webrtc
});








































// hide some informations in the navigator object
Hook.setupHookWindow(function(createHookFunction, windowObject)
{
	try
	{
		Object.defineProperty(windowObject.navigator, 'maxTouchPoints', {
			value: 0,
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'hardwareConcurrency', {
			value: undefined,
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'oscpu', {
			value: undefined,
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'platform', {
			get: function(){return Parameters.getPlatfrom();},
			configurable: false,
			enumerable: false,
			set: function(){}
		});
	}
	catch(e){}





	try
	{
		Object.defineProperty(windowObject.navigator, 'userAgent', {
			get: function(){return Parameters.getUserAgent();},
			configurable: false,
			enumerable: false,
			set: function(){}
		});
	}
	catch(e){}


	// todo improve the sentences (bad english)
	// !!!!!! important this needs to be at the bottom
	// as it changes the name of variables
	// -> could break e.g. the webrtc block if it's on the top of the code
	// replace the webkit prefix for firefox user agents
	(function(windowObject)
	{
		Parameters.onLoaded(function(){

			if(Parameters.isFirefox())
			{
				for(var key in windowObject)
				{
					if(key != null
						&& key.indexOf('webkit') == 0)
					{
						var keyNew = key.replace('webkit', 'moz');
						var strSource = null;

						try
						{
							strSource = windowObject[key].toString().replace('webkit', 'moz');
						} catch(e) {}

						(function(windowObject, keyNew, key, strSource)
						{
							try
							{
								Object.defineProperty(windowObject, keyNew, {
									value: windowObject[key],
									configurable: true,
									enumerable: true,
									writable: false
								});
								windowObject[keyNew].toString = function(){return strSource;};

								// remove old key from window-object
								Object.defineProperty(windowObject, key, {
									value: undefined,
									configurable: true,
									enumerable: false,
									writable: true
								});
							}
							catch(e){}
						})(windowObject, keyNew, key, strSource);
					}
				}
			}
		});
	})(windowObject);



	try
	{
		Object.defineProperty(windowObject.navigator, 'appVersion', {
			get: function(){return Parameters.getAppVersion();},
			configurable: false,
			enumerable: false,
			set: function(){}
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'appName', {
			value: 'Netscape', // value doesn't differ in firefox & chrome
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'appCodeName', {
			value: 'Mozilla', // value doesn't differ in firefox & chrome
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'vendor', {
			value: '',
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
	try
	{
		Object.defineProperty(windowObject.navigator, 'vendorSub', {
			value: '',
			configurable: false,
			enumerable: false,
			writable: false
		});
	}
	catch(e){}
});
//alert('so');
// execute the blocked inline-scripts
// this breaks some sites -.-
/*setTimeout(function()
{
	console.clear();
var aScripts = document.getElementsByTagName('script');
for(var key in aScripts)
{
	if(aScripts[key]
		&& aScripts[key].innerHTML
		&& aScripts[key].innerHTML.length > 0)
	{
		//console.log(aScripts[key].innerHTML);
		var strCode = aScripts[key].innerHTML;
		eval(strCode);
		//var par = aScripts[key].parentElement;
		//par.appendChild(par.removeChild(aScripts[key]));
	}
}
}, 0);*/
