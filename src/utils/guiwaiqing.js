export function passSecretCent(voiceType, len, timeout)
{
  var GWQObj = document.getElementById("CENT_GWQ");
  if(GWQObj == null )
  {
    return ;
  }
  var ret = GWQObj.in_pad(parseInt(voiceType), parseInt(len), parseInt(timeout));
  if ( ret > 0)
  {
    return  GWQObj.sd;
  }
  else
  {
    return ;
  }
}

export function passSecretLSC(modex, len, timeout){

  var gwqobj=document.getElementById("GWQ_Ctrl");
  if(gwqobj == null )
  {
    return;
  }
  var pin=gwqobj.in_pad(modex, len, timeout);
  if (pin == "")
  {
    return;
  }
  return pin;
}

export function passSecretNT(modex, len, timeout)
{
    var ntDev = document.getElementById("GWQ_nantian");
    if(ntDev==null)
    {
      return ;
    }
    var iRet = "";
    iRet = ntDev.In_Pad(modex, len, timeout);
    if(iRet && iRet.length > 0) {
      return iRet;
    }
    return;
}
