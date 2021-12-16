var ws = null;
var start = function () {
   ws = new WebSocket("ws://172.16.66.48:18884/");
   ws.onopen = function () {
      alert("连接已打开");
   };

   ws.onmessage = function (evt) {
   };

   ws.onclose = function () {
      alert("连接已关闭");
   };
}
window.onload = start;

//进卡
export function MoveToIC() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("moveIcInput").value);
      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("moveIC").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

//打印图片
export function PrintPicture() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("pictureInput").value);

      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("picture").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

//打印文字
export function PrintText1() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("InputText1").value);

      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("text1").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

export function PrintText2() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("InputText2").value);

      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("text2").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

export function PrintText3() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("InputText3").value);

      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("text3").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

export function PrintText4() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("InputText4").value);

      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("text4").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

//开始打印
export function StartPrint() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("printStart").value);

      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("print").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

//退废卡
export function RejectCard() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("rejectCard").value);

      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("reject").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

//获取设备信息
export function GetDeviceInfo() {
   if ("WebSocket" in window) {
      ws.send(document.getElementById("getInfo").value);

      ws.onmessage = function (evt) {
         var received_msg = evt.data;
         document.getElementById("deviceInfo").value = received_msg;
      };
      ws.onclose = function () {
         alert("连接已关闭...");
      };
   }
   else {
      // 浏览器不支持 WebSocket
      alert("您的浏览器不支持 WebSocket!");
   }
}

