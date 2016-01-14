

function randfloat(min, max)
{
	return Math.random() * (max-min) +min;
}

function rand(min, max)
{
	return parseInt(randfloat(min, max));
}

function clearStorage(storage, prefix)
{
	if(storage)
	{
	//	var keys = storage.keys();

		for(var i = 0; i < storage.length; i++)
		{
			var key = storage.key(i);
			if(key && key.indexOf(prefix) == 0)
			{
				storage.removeItem(key);
			}
		}
	}
}


function clearCache(storage, prefix)
{
	if(storage)
	{
		var keys = storage.keys();
		for(var key in keys)
		{
			if(key && key.indexOf(prefix) == 0)
			{
				storage.delete(key);
			}
		}
	}
}