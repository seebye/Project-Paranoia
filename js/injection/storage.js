// localstorage, globalstorage, etc.
// todo
var storage = new function()
{
	var private = {};
	var public = {};

	private.m_storage = null;

	/**
	* The key() method of the Storage interface, passed a number n, will return the name of the nth key in the storage.
	*
	* @param key An integer representing the number of the key you want to get the name of. This is a zero-based index.
	*/
	private.key = function(key) {

	};

	/**
	*
	* @param keyName A DOMString containing the name of the key you want to retrieve the value of.
	*/
	private.getItem = function(keyName) {

	};

	/**
	*
	* @param keyName	A DOMString containing the name of the key you want to create/update.
	* @param keyValue	A DOMString containing the value you want to give the key you are creating/updating.
	*
	* !! throws an exception -> remove prefix!!
	*/
	private.setItem = function(keyName, keyValue) {

	};

	/**
	*
	* @param keyName	A DOMString containing the name of the key you want to remove.
	*/
	private.removeItem = function(keyName) {

	};

	private.clear = function() {

	};

	public.init = function(objectStorage) {
		private.m_storage = objectStorage;

		
	};

	public.constructor = function() {

		delete public.constructor;
		return public;
	};

	return public.constructor.apply(public, arguments);
}();
