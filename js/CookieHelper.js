
/************************************************************
* Cookie操作    											*
* 注意：													*
*   浏览器中Cookie有大小和个数限制							*
*   限制一般是数量50个，总大小4096字节（包括name和value）。	*
*************************************************************/
var CookieHelper = {
    ProductLineID: "",
    //创建Cookie
    //name：Cookie名
    //value：Cookie值
    //second：有效时间，秒
    Set: function (name, value, second) {//添加cookie
        var str = name + "=" + escape(value);
        if (second != null && second > 0) {//为0时不设定过期时间，浏览器关闭时cookie自动消失
            var date = new Date();
            date.setTime(date.getTime() + second * 1000);
            str += ";expires=" + date.toGMTString();
        }
        document.cookie = str;
    },
    //获取Cookie
    //name：Cookie名
    Get: function (name) {//获取指定名称的cookie的值
        var arrStr = document.cookie.split("; ");
        for (var i = 0; i < arrStr.length; i++) {
            var temp = arrStr[i].split("=");
            if (temp[0] == name) return unescape(temp[1]);
        }
        return "";
    },
    //删除Cookie
    //name：Cookie名
    Remove: function (name) {//为了删除指定名称的cookie，可以将其过期时间设定为一个过去的时间
        var date = new Date();
        date.setTime(date.getTime() - 10000);
        document.cookie = name + "=a; expires=" + date.toGMTString();
    }
}