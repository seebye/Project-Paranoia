window.Array.prototype.removeValue = function(item)
{
	var bFound = false;

	for (var i = 0, nLen = this.length
		; i < nLen
			&& !bFound
		; i++)
	{
		if(this[i] == item)
		{
			bFound = true;
			this.splice(i, 1);
		}
	}
};
window.Array.prototype.remove = function(index)
{
	this.splice(index, 1);
};
function getRand(nMin, nMax)
{
  return Math.round(Math.random() * (nMax - nMin) + nMin);
}

function generateIP()
{
	var strIP = null;

	while(strIP == null
		// private addresses..
		|| strIP.indexOf("127.") == 0
		|| strIP.indexOf("10.") == 0
		|| strIP.indexOf("172.") == 0
		|| strIP.indexOf("192.") == 0)
	{
		strIP = getRand(1, 254)+"."+getRand(1, 254)+"."+getRand(1, 254)+"."+getRand(1, 254);
	}

	return strIP;
}