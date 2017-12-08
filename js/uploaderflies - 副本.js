var $ = function(id) {
    return document.getElementById(id)
};
function dislog(title,content){
    layer.open({
        title:title,
        type: 1,
        area: ['600px', '360px'],
        shadeClose: true, //点击遮罩关闭
        content:content
    });
}
var ctheader = $("ctheader"),
    form1 = $("form1"),

    submit = $("submit"),
    fileArray = [],
    fileSplitSize = 1024 * 10000;

function fileSelected() {
     var files =$("fileToUpload").files;
     console.log(files);
      var shtml = "";
      shtml +="<table class='table table-hover filesFilter' >";
      shtml += "<thead>";
      shtml += "<tr><th>名称</th><th>类型</th> <th>大小</th><th>时间</th></tr>";
      shtml +="</thead>";
      shtml +="<tbody>";
      //判断文件大小及文件类型
      for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var data = new Date().toLocaleString();
          var name= file.name;
          var size = file.size;
          var type = file.type || "";
          var fileSize = 0;
          var total=0;
          var id = (file.lastModifiedDate + "").replace(/\W/g, "") + size + type.replace(/\W/g, "");

          //对文件类型及文件大小做判断处理
          // if (type.indexOf("dcm") == 0) {
          //
          // }
          // else {
          //     alert('文件"' + file.name + '"不是dicom');
          // }


          //名称截取
          if (name.length > 50) {
             name = name.slice(0, 10) + "..." + name.slice( - 10);
          }
      //   判断文件大小
          if (size > 1024 * 1024) {
              size = Math.round(size / (1024 * 1024) * 10) / 10 + "M"
          } else {
              if (size > 1024) {
                size = Math.round(size / 1024 * 10) / 10 + "KB"
              }
          }

          if (size > 1024 * 20000) {
              id = Math.random();
              alert("文件过大");
          } else {

                  shtml += "<tr><td>" + name + "</td><td>" + type + "</td><td>" + size + "</td><td>" +data + "</td></tr>";

          }
          total +=size;
      }


       shtml +="</tbody>";
       shtml += "</table>";
       shtml +="<p class=\"totalFiles1\"><span>文件上传大小超过200M，请分次上传</span></p>"
       shtml +="<p class=\"totalFiles\"><span>22个&nbsp;&nbsp;共400M</span></p>"

       shtml+= "<form id=\"form2\" enctype=\"multipart/form-data\" >";
       shtml += "<input type=\"submit\" id=\"submit\" class=\"btn btn-primary submitBtn\" value=\"上传并筛选\" onclick=\" uploadFile() \">";
       shtml += "</form>";
      var txt=  shtml;
      var title1= "检测出待上传DICOM文件";


         dislog(title1,txt);
         var form2 = $("form2");
    form2.addEventListener("submit",
        function(event) {
            // debugger;
            event.preventDefault();
            uploadFile();
        });

    }

    function uploadFile() {
      //定义表单变量    
      var files = document.getElementById('fileToUpload').files;
      var progress = document.getElementById('prog');

          // 上传文件验证

        // var total=10000;
        // var breaker=100;
        // var turn=100/(total/breaker);
        // var progress=0;
        // var timer = setInterval(function(){
        //     progress=progress+turn;
        //     document.getElementById('aa').innerHTML=progress;
        //     document.getElementById('processbar').setAttribute("style", "width:"+progress+"%");
        //     if (progress>=100) {
        //         clearInterval(timer);
        //     }
        // }, breaker);
      var title2="上传进度条";
        var upPregress =' ';
        // upPregress +='<div class="upload-progress"><span class="upload-son" id="uploaderprogress">DICOM文件上传中……</span></div>';
        upPregress+='<div class="progress progressStyle">';
       upPregress+='<div class="progress-bar" style="width:40%;" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" >40%</div>';
       upPregress+='</div>';
       upPregress+='<span class=" layui-layer-close layui-layer-close1 closeBtn" >取&nbsp;&nbsp;消</span>';
    
      // //  上传文件弹窗
      dislog(title2,upPregress);
      var SeriesSets = {};
        parseDicomFiles(files);
        function parseDicomFiles(files) {
           if (!files.length) return;
           const dicomImage = new DICOMImage();
           dicomImage.loadDicomFiles(files).then(function(seriesSets) {
               // debugger
               SeriesSets = seriesSets;
               console.log(SeriesSets);
               // debugger
              filesDicom(SeriesSets);

               // for (var i = 0; i<=SeriesSets.length; i++) {
               //   console.log(SeriesSets[2]);
               // };
           });
      }

      //新建一个FormData对象    
      var formData = new FormData();
      var fileSign = {};
       for (var i = 0, j = 0; i < files.length; i++) {
        // debugger
        var file = files[i]
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        (function (file) {
          reader.onload = function (e) {
            var fileBuffer = e.target.result;
            // debugger
            var res = getBinary(fileBuffer);
            // debugger;
            var cres = crc32(new Uint8Array(fileBuffer));
            console.log(cres);
            fileSign[file.name] = cres;
            res = new Base64().encode(res);
            formData.append("data", new Blob([res], { type: 'application/octet-stream' }), file.name);
            if (j === files.length - 1) {
              var fileinfo = {
                institutionId: "00001",
                channelId: "00002",
                serialUID: "0000001.0001",
                fileSign: fileSign
              }
              formData.append('fileinfo', new Blob([JSON.stringify(fileinfo)], { type: 'application/json' }, 'fileinfo'));
              sendData(formData);
            }
            j++;
          }
        })(file);
      }


        function sendData(formData) {
        var xhr = new XMLHttpRequest();
         var uploaderprogress = document.getElementById("uploaderprogress");
          // xhr.onprogress=handleProgress;
          xhr.open("POST", "http://103.28.215.253:10219//uploadFile");
        xhr.send(formData);
        //请求生命周期的不同阶段
        xhr.addEventListener('readystatechange', function handleResponse(e) {
          if (xhr.readyState == 4 && xhr.status == 200) {
            // document.getElementById("results").innerHTML = xhr.responseText;
            var page1 = document.getElementById("page1");
            var page2 = document.getElementById("page2");
            var domCanvas = document.getElementById("dicomImage");
              uploaderprogress.innerHTML = '100%';
              page1.style.display="none";
              page2.style.display="block";
              // debugger
              var dicomViewer = new DICOMViewer(domCanvas);
              // 查看器点击事件
              bindEvent(dicomViewer);
              // 点击列表项按钮
              // 获取seriesID
              var seriesID = Object.keys(SeriesSets)[0];
              // 请求结点数据
              var pointsSet = [
                  {"diameter":"30","density":"600","dicomImageKey":"22","probability":"90.1","imageNo":"-360.5","location":"90,43","jpgImageKey":"22"},
                  {"diameter":"15","density":"400","dicomImageKey":"11","probability":"98.9","imageNo":"-360.5","location":"100,234","jpgImageKey":"11"},
                  {"diameter":"15","density":"400","dicomImageKey":"11","probability":"98.9","imageNo":"-196.5","location":"100,234","jpgImageKey":"11"},
                  {"diameter":"25","density":"400","dicomImageKey":"11","probability":"98.9","imageNo":"-196.5","location":"250,450","jpgImageKey":"11"}
              ];

              dicomViewer.setDcmSeriesInfo(SeriesSets[seriesID],pointsSet);
          }
        });
        var upload = xhr.upload;
        // 加载进度条
        upload.addEventListener('progress', function (e) {
             if (e.lengthComputable) {
                 var percent = Math.round(loaded / total * 100);
                    // document.getElementById('progress').value = percentComplete;
                    // document.getElementById('progressNumber').style.width = percentComplete + "%";
                    
              }
              // debugger;
            layer.open({

                type: 1,
                area: ['600px', '360px'],
                shadeClose: true, //点击遮罩关闭
                content:uploaderprogress.innerHTML
            });
             // console.log(uploaderprogress.innerHTML)

        });

        xhr.addEventListener('load', function (e) {
             var txt_load=  "加载";
            dislog('',txt_load);
        });
         // 请求开始触发
        xhr.addEventListener('loadstart', function (e) {
        var txt_start=  "开始";
        dislog('',txt_start);
          
        });
       // 请求结束触发 
       xhr.addEventListener('loadend', function (e) {
           var txt_end=  "结束";
           dislog('',txt_end);
            layer.closeAll();
        });
       //请求出错误
        xhr.addEventListener('errror', function (e) {
        i
        var txt_errror=  "请求错误";
            dislog('',txt_errror);
        });
        // 请求超时
       xhr.addEventListener('timeout', function (e) {
          var txt_timeout="请求超时";
            dislog('',txt_timeout);
        });
        //请求中止 
       xhr.addEventListener('abort', function (e) {
        var txt_abort=  "中止";
           dislog('',txt_abort);
        });

        // xhr.send(JSON.stringify(formData));
      }
    }
    function getBinary(res) {
      var binary = "";
      var bytes = new Uint8Array(res);

      var length = bytes.byteLength;

      for (var i = 0; i < length; i++) {

        binary += String.fromCharCode(bytes[i]);

      }
      return binary;
    }
    function Base64() {

      // private property
      _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

      // public method for encoding
      this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }
          output = output +
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
      }
    } 
    function crc32(str) {
      //str = Utf8Encode(str);  
      var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
      var crc = 0;
      var x = 0;
      var y = 0;

      crc = crc ^ (-1);
      for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = (crc ^ str[i]) & 0xFF;
        x = "0x" + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
      }

      return (crc ^ (-1)) >>> 0;
    };
     /*canvasBtn 操作事件*/ 
     function bindEvent(dicomViewer) {
            document.getElementById('up').addEventListener('click',function (e) {
                dicomViewer.up();
            });
            document.getElementById('down').addEventListener('click',function (e) {
                dicomViewer.down();
             });
            document.getElementById('zoomin').addEventListener('click',function (e) {
                dicomViewer.zoomIn();
            });
            document.getElementById('zoomout').addEventListener('click',function (e){
                dicomViewer.zoomOut();
            });
            document.getElementById('reset').addEventListener('click',function (e) {
                dicomViewer.reset();
            });
            dicomViewer.setPointEvent(function(point) {

            });
            initRangeSlider(dicomViewer);
        }
/** rangeSlider **/ 
function initRangeSlider(dicomViewer){
      var elem = document.querySelector('input[type="range"]');
      var rangeValue = function(){
        var newValue = elem.value;
        var max = elem.setAttribute("max",dicomViewer.forward(newValue));
        var target = document.querySelector('.value');
        target.innerHTML = newValue+'/'+max;
        var width = (91.3 / max * newValue) +"%";  
        document.querySelector('.rang_width').style.width = width;
        dicomViewer.forward(newValue);
      };
      elem.addEventListener("input", rangeValue);
}  
/*creat_group_list*/
function filesDicom(SeriesSets){
            var seriesIDList = Object.keys(SeriesSets);
              console.log(seriesIDList);
             var fileDicom=' ';
              var groupId =seriesIDList[0];
          seriesIDList.forEach(function(seriesID){
            var group = SeriesSets[seriesID];
          
            fileDicom +='<ul class="nav nav-list accordion-group" id="'+groupId+'">';
            fileDicom+='<li class="nav-header nav-header-content">';
            fileDicom +=' <div class="title_hd">';
            fileDicom +='     <img src="'+group[0].imageData+'" alt="" style="width:68px;margin-right:5px;display:block">';
            fileDicom+='               <span><em>'+group.length+'</em>张</span>';
            fileDicom+='  </div>';
            fileDicom +=' <div class="titlediv">';
            fileDicom+='    <span class="title">SX_001</span>';
            fileDicom+='    <span class="">胸透CT '+group[0].SeriesDate+'</span>';
            fileDicom +='   <span class=""><em>'+group[0].PersonName+'</em><em>&nbsp;'+group[0].PatientSex+'</em><em>&nbsp;'+group[0].PatientAge+'</em></span>';
            fileDicom+='  </div>';
            fileDicom +='  <span class="title_right">0个字节</span>';
            fileDicom+=' </li>';
            fileDicom +=' <li style="display: none;" class="boxes estRows">';
            fileDicom +=' <div class="clear"></div>';
            fileDicom +='   <table class="table tableHover">';
            fileDicom +='     <thead>';
            fileDicom +='       <tr><th>结节编号</th><th>直径/mm</th><th>层面</th><th>可能性</th></tr>';
            fileDicom +='     </thead>';
            fileDicom +='     <tbody>';
              /**节点信息获取  start**/
            fileDicom +=   pointsSet.map(function(point){
                          var dom ='';
                           dom +=' <tr id="' + point.location + '"" class="point-row"> ';
                          dom +='<td>'+point["jpgImageKey"]+'</td><td>'+point["diameter"]+'</td><td>'+point["imageNo"]+'</td><td>'+point["probability"]+'</td><td>';    
                           dom +=' </tr>  ';
                          return dom;
                    });
            
            /**节点信息获取  end**/
              fileDicom +=' </tbody>';
              fileDicom+='  </table>';
              fileDicom +=' </li>';
              fileDicom+=' </ul>';


           });
     document.querySelector('.sidebar-nav').innerHTML = fileDicom;
      /*节点操作控制*/ 
      document.querySelectorAll('.point-row').forEach(function(tr){
        tr.addEventListener('click', function(e) {
            // debugger
            var el = e.currentTarget;
            var targetPoint = pointsSet.filter(function(point) {
              return el.id === point.location;
            })[0];
            console.log(targetPoint);
            pointRowMsg(targetPoint);
            document.querySelector('.left_message').style.display="block";
        })
      });
       /*下拉菜单切换*/ 
       // document.querySelectorAll(".accordion-group").forEach(function(elem){
       //     elem.addEventListener('click',function(e){
       //                var groupId=e.target.id;
       //                debugger;
       //                var pointMsgStatus = document.querySelectorAll('.estRows');
       //                if( pointMsgStatus.style.display == 'block'){
       //                     pointMsgStatus.style.display ='none'; 
       //                }else{
       //                    pointMsgStatus.style.display ='block'; 
       //                }
                  
       //          });
       // });
       document.getElementById(groupId).addEventListener('click',function(){
                   var pointMsgStatus = this.querySelector('.estRows');
                    pointMsgStatus.style.display ='block'; 
                   // var groupIdTtyle=document.getElementById(groupId);
                    this.querySelector('.nav-header-content').style.border="1px solid #fff";
                   // console.log(pointMsgStatus);
                   //    if( pointMsgStatus.style.display=="block"){
                   //         pointMsgStatus.style.display ='none'; 
                   //    }else{
                   //        pointMsgStatus.style.display ='block'; 

                   //    }
       });
     
}

function pointRowMsg(obj){
      var pointMsg =' ';
      pointMsg +='   <div class="left_message_top">';
      pointMsg +='        <span><img src="img/nodepoint.png" alt="" style="width:30px;position:relative;right:10px;"><em>3</em>个节点</span>';
      pointMsg +='        <span class="nodepoint" id="pointImg"><img src="img/checkpointhide.png" alt="" style="width:30px;" id="imgChange"></span>';
      pointMsg +='       </div>';
      pointMsg +='      <div class="clear"></div>';
      pointMsg +='      <div class="nodelPointMessage">';
      pointMsg+='<div class="nodelPointMessageList">';
      pointMsg+='<div class="nodelPointMessageListTop"><span>结节'+obj.dicomImageKey +'</span><span id="delete" class="nodepoint">X</span></div>';
      pointMsg+='<div class="nodelPointMessageListBody">';
      pointMsg+='<span>直径：'+obj.diameter+'</span>';
      pointMsg+='<span>密度：'+obj. jpgImageKey+'</span>';
      pointMsg+='<span>可能性：'+obj.location+'</span>';
      pointMsg+='<span>坐标：'+obj.probability+'</span>';
      pointMsg+='</div>';
      pointMsg +=' </div>';
      pointMsg +='   <div class="nodelPointMessagePage"><span class="nodePageActive upNode" id="upNode">上一个</span><span class="downNode" id="downNode">下一个</span></div>';
      document.querySelector('.left_message').innerHTML = pointMsg;
      document.getElementById("delete").addEventListener('click',function(e){
         document.querySelector('.nodelPointMessage').style.display="none";
      });

      document.getElementById("pointImg").addEventListener('click',function(e){
         showdiv();
      });
      // 上一个节点
      document.getElementById("upNode").addEventListener('click',function(e){
        
      });
      //下一个节点
      document.getElementById("downNode").addEventListener('click',function(e){
         
      });
 }
/**图片切换**/ 
function showdiv(){
      var target=document.querySelector('.nodelPointMessage');
      var clicktext=document.getElementById('imgChange');
            if (target.style.display=="block"){
                target.style.display="none";
                clicktext.src="img/checkpointshow.png";
            } else {
                target.style.display="block";
                clicktext.src='img/checkpointhide.png';
            }
}





