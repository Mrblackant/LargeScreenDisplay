import { Message,MessageBox} from 'element-ui';

//base64数据转成图片并下载
export function downloadImg(qrBase64) {
    if(isEmpty(qrBase64)){
      MessageBox("图片内容为空，不可进行下载");
      return;
    }
    // 这里是获取到的图片base64编码,这里只是个例子哈，要自行编码图片替换这里才能测试看到效果
    const imgUrl = 'data:image/jpeg;base64,'+qrBase64
    // 如果浏览器支持msSaveOrOpenBlob方法（也就是使用IE浏览器的时候），那么调用该方法去下载图片
    if (window.navigator.msSaveOrOpenBlob) {
      const bstr = atob(imgUrl.split(',')[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr])
      window.navigator.msSaveOrOpenBlob(blob, 'chart-download' + '.' + 'jpg')
    } else {
      // 这里就按照chrome等新版浏览器来处理
      const a = document.createElement('a')
      a.href = imgUrl
      a.setAttribute('download', 'chart-download.jpg')
      a.click()
    }
  }

//base64数据转成pdf并下载
export function downloadPdf(qrBase64) {
  if(isEmpty(qrBase64)){
    MessageBox("pdf内容为空，不可进行下载");
    return;
  }
  // 这里是获取到的图片base64编码,这里只是个例子哈，要自行编码图片替换这里才能测试看到效果
  const pdfUrl = 'data:application/pdf;filename=generated.pdf;base64,'+qrBase64
  // 如果浏览器支持msSaveOrOpenBlob方法（也就是使用IE浏览器的时候），那么调用该方法去下载图片
  if (window.navigator.msSaveOrOpenBlob) {
    const bstr = atob(pdfUrl.split(',')[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    const blob = new Blob([u8arr])
    window.navigator.msSaveOrOpenBlob(blob, 'chart-download' + '.' + 'pdf')
  } else {
    // 这里就按照chrome等新版浏览器来处理
    const a = document.createElement('a')
    a.href = pdfUrl
    a.setAttribute('download', 'chart-download.pdf')
    a.click()
  }
}

//获取当前页面的缩放值
export function getZoom() {
  let ratio = 1,
     screen = window.screen,
    ua = navigator.userAgent.toLowerCase();
    if (window.devicePixelRatio ) {
        ratio = window.devicePixelRatio;
    }
    else if (~ua.indexOf('msie')) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
            ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
    }
    else if (window.outerWidth  && window.innerWidth ) {
        ratio = window.outerWidth / window.innerWidth;
    }
    console.log(ratio)
    // if (ratio) {
    //     ratio = Math.round(ratio * 100);
    // }
    return ratio;
}

  //判断字符是否为空的方法
export function isEmpty(obj){
    if(typeof obj == "undefined" || obj == null || obj == ""){
        return true;
    }else{
        return false;
    }
}

//将img转为 base64
export function ImagetoBase64jpg(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var dataURL = canvas.toDataURL("image/jpeg");
  return dataURL.replace("data:image/jpeg;base64,", "");
}
//将img转为 base64
export function ImagetoBase64png(img) {
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0 );
  var dataURL = canvas.toDataURL('image/png');
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
}

// 生成指定位数的随机数
export function getsjs(digit){
  let Num="";
  for(var i=0;i<digit;i++)
  {
      Num+=Math.floor(Math.random()*10);
  }
  return Num;
}

//执行cmd命令
export function runcmd(order){
  try {
    var objShell = new ActiveXObject("WScript.Shell");
    iReturnCode = objShell.Run("cmd.exe /c "+order, 0, true);
  } catch (e) {
    alert(iRetrunCode);
    console.dir(e);
  }
}
