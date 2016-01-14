var UrlParameters = function()
{
	var private = {};
	var public = {};

	private.m_strURL = "";
	private.m_strSign = "?";

	private.m_strParams = "";

	public.getURL = function() {
		return private.m_strURL + private.m_strSign + private.m_strParams;
	};

	public.getParams = function() {
		return private.m_strParams;
	};

	public.addParam = function(strKey, strValue) {
		if(private.m_strParams.length != 0) {
			private.m_strParams += "&";
		}
		private.m_strParams += strKey +"="+ encodeURIComponent(strValue);
	};

	public.constructor = function(strURL) {
		private.m_strURL = strURL;

		if(strURL.indexOf("?") >= 0)
		{
			private.m_strSign = "&";
		}

		public.constructor = undefined;//delete public.constructor;
		return public;
	};

	return public.constructor.apply(public, arguments);
};