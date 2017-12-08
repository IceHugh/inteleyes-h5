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
    fileArray = [ ],
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
       var total=0;
      for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var data = new Date().toLocaleString();
          var name= file.name;
          var size = file.size;
          var type = file.type || "";
          var fileSize = 0;
         var stuff=name.match(/^(.*)(\.)(.{1,8})$/)[3]; 
         console.log(stuff);
          var id = (file.lastModifiedDate + "").replace(/\W/g, "") + size + type.replace(/\W/g, "");
          console.log(id);

          //对文件类型及文件大小做判断处理
         if(stuff!="dcm"){
            // alert("请选择正确文件");
            return false;
  
          }

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

          // if (size > 1024 * 2) {
          //     id = Math.random();
          //     debugger
          //     console.log(id);
          //     alert("文件过大");
          // } else {

          //         shtml += "<tr><td>" + name + "</td><td>" + type + "</td><td>" + size + "</td><td>" +data + "</td></tr>";

          // }
        shtml += "<tr><td>" + name + "</td><td>" + type + "</td><td>" + size + "</td><td>" +data + "</td></tr>";
        
          total +=files[i].size; 
         var filesSize=Math.round(total / (1024 * 1024) * 10) / 10 + "M";
      }
     


       shtml +="</tbody>";
       shtml += "</table>";
       shtml += "<div class=\"footerBottom\">";
       shtml +="<p class=\"totalFiles1\"  id=\"totalFiles1\" style=\"display:none;\"><span>文件上传大小超过200M，请分次上传</span></p>"
       shtml +="<p class=\"totalFiles\"><span><em style=\" color:#ff7000;\">"+files.length+"</em>个&nbsp;&nbsp;共<em style=\" color:#ff7000;\">"+filesSize+"</em></span></p>"
       shtml+= "<form id=\"form2\" enctype=\"multipart/form-data\" >";
       shtml += "<input type=\"submit\" id=\"submit\" class=\"submitBtn\" value=\"上传并筛选\">";
       shtml += "</form>";
       shtml += "</div>";
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
      if(filesSize >= 2){
          document.getElementById("totalFiles1").style.display="block";
      }
      else{
         document.getElementById("totalFiles1").style.display="none";
      }
         // 文件去重处理
      // if(fileArray.indexOf(id) != -1){
      //       console.log(fileArray.indexOf(id) != -1);
      // }else{
      //    fileArray.push(id);
      //     fileArray[id] = file
      // }
    }

    function uploadFile() {
      //定义表单变量    
      var files = document.getElementById('fileToUpload').files;
      console.log(files);
      var progress = document.getElementById('prog');
      var title2="上传进度条";
        var upPregress =' ';
        // upPregress +='<div class="upload-progress"><span class="upload-son" id="uploaderprogress">DICOM文件上传中……</span></div>';
      upPregress+='<div class="progress progressStyle">';
       upPregress+='<div id="progressbar" class="progress-bar" style="width:0%;" role="progressbar" >0%</div>';
       upPregress+='</div>';
       upPregress+='<span class=" layui-layer-close layui-layer-close1 closeBtn" >取&nbsp;&nbsp;消</span>';
    
      // //  上传文件弹窗
      dislog(title2,upPregress);
      var SeriesSets = {};
      if (!files.length) return;
      var dicomImage = new DICOMImage();
      dicomImage.loadDicomFiles(files).then(function(seriesSets) {
          SeriesSets = seriesSets;
          var progressbar = document.getElementById('progressbar');
          var dicomUploader = new DICOMUploader(seriesSets,{
              url: 'http://103.28.215.253:10219//uploadFile',
              progress: function(step,res) {
                var percent = Math.floor(step*100) + '%';
                console.log(percent);
                progressbar.style.width = percent;
                progressbar.innerHTML = percent;
              }
          });
          return dicomUploader.send();
      }).then(function(res) {
        // 判断是否为肺部影像
      if(false){
        var dicomcheck = "您上传的文件非胸部CT，目前仅支持智能识别肺结节，请重新上传"
        dislog('&nbsp;',dicomcheck);
        }else{
            var page1 = document.getElementById("page1");
            var page2 = document.getElementById("page2");
            var domCanvas = document.getElementById("dicomImage");
              // uploaderprogress.innerHTML = '100%';
              page1.style.display="none";
              page2.style.display="block";
          var dicomViewer = new DICOMViewer(domCanvas);
          var seriesID = Object.keys(SeriesSets)[0];
          // 查看器点击事件 
          bindEvent(dicomViewer,SeriesSets[seriesID].length);
  
          // 点击列表项按钮
          // 获取seriesID
          // 请求结点数据
          var pointsSet = [
              {"diameter":"30","density":"600","dicomImageKey":"22","probability":"90.1","imageNo":"-360.5","location":"180,303","jpgImageKey":"22"},
              {"diameter":"15","density":"400","dicomImageKey":"11","probability":"98.9","imageNo":"-360.5","location":"100,234","jpgImageKey":"11"},
              {"diameter":"30","density":"300","dicomImageKey":"22","probability":"90.1","imageNo":"-360.5","location":"280,83","jpgImageKey":"22"},
              {"diameter":"15","density":"500","dicomImageKey":"11","probability":"98.9","imageNo":"-360.5","location":"300,134","jpgImageKey":"11"},
              {"diameter":"15","density":"400","dicomImageKey":"11","probability":"98.9","imageNo":"-196.5","location":"100,234","jpgImageKey":"11"},
              {"diameter":"25","density":"400","dicomImageKey":"11","probability":"98.9","imageNo":"-196.5","location":"250,450","jpgImageKey":"11"}
          ];
          dicomViewer.setDcmSeriesInfo(SeriesSets[seriesID],pointsSet);
          filesDicom(SeriesSets,dicomViewer);
           // dislog('','上传成功');
            layer.closeAll();
       }
      }).catch(function(err) {
          console.log(err || '失败')
          // var offline="网络中断，待网络正常后继续上传";
          //   layer.open({
          //     type: 1
          //     ,content: offline
          //     ,btn: '放弃上传,取消'
          //     ,btnAlign: 'c' //按钮居中
          //     ,shade: 0 //不显示遮罩
          //     ,yes: function(index){
          //       layer.closeAll();
          //     }
          //   });
      });
    }
     /*canvasBtn 操作事件*/ 
     function bindEvent(dicomViewer ,firstDcmNumber) {
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
            initRangeSlider(dicomViewer,firstDcmNumber);
        }
/** rangeSlider **/ 
function initRangeSlider(dicomViewer,dcmNumber){
        // debugger
      var elem = document.querySelector('input[type="range"]');
       elem.setAttribute("max",dcmNumber);

      // elem.removeEventListener('input');
      var rangeValue = function(){
        var newValue = elem.value;
        var target = document.querySelector('.value');
        target.innerHTML = newValue+'/'+dcmNumber;
        var width = (91.3 / dcmNumber * newValue) +"%";  
        document.querySelector('.rang_width').style.width = width;
             dicomViewer.forward(newValue);
      };
 
      elem.oninput = rangeValue;
} 

/*请求AI接口结果，是否发起轮询*/ 
function requestResult(seriesInstanceUid){

             var requestAI = new XMLHttpRequest();
             var url =  "http://103.28.215.253:10219/requestAI?seriesInstanceUid=" + seriesInstanceUid;
             var pointList=10;//没有做数据处理
             var dicomcheckResult= document.getElementById("dicomcheckResult");
             

             requestAI.onreadystatechange=handleResponse;  
             requestAI.open("GET",url , true);
             function handleResponse (data){
                    if (requestAI.readyState == 4 && requestAI.status == 200) {
                         loopRequest({
                              url : "http://103.28.215.253:10219/requestResult?seriesInstanceUid=" + seriesInstanceUid,
                              success:function(){
                                      dicomcheckResult.innerHTML='<span class="complete">'+ +'个结节</span> ';
                              },
                              loading:function(){
                                       function setProcess(){
                                              var checkProgress= document.getElementById("checkProgress");
                                               if(checkProgressBar.style.width == "90%") return;
                                              var checkProgressBar= document.getElementById("checkProgressBar");
                                              var checkProgressBarWidth= checkProgressBar.style.width; 
                                              checkProgressBarWidth = parseInt(checkProgressBarWidth.slice(-1))+5+'%'
                                        }
                                       var time = setInterval(function(){setProcess();},500)
                                      // dicomcheckResult.innerHTML='<span class="checking">结节检测中...</span>';
                              },
                              error:function(){
                                       dicomcheckResult.innerHTML='<span class="checkError"><span>出现错误</span><span>重新检测</span></span>';
                              }
                          });
                    }
              } 
             
             requestAI.send();
}
/*请求成功时，轮询*/ 
function loopRequest(options){
      var loopResult = new XMLHttpRequest();
       loopResult.onreadystatechange=handleResponse;  
       loopResult.open("POST",options.url , true);
       //请求成功时
       function handleResponse (data,testStatus){
              if (requestAI.readyState == 4 && requestAI.status == 200) {
                   if(res){
                          if(res["code"] == "000000"){
                                options.success();
                          }else if (res["code"] == "100860") {
                                options.loading();
                                setTimeout(function(){ loopRequest();},30000);
                          } else {
                                options.error();
                          }

                   } else {
                          options.error();
                   }
              };
      } 
       loopResult.send();
}
/*creat_group_list*/
function filesDicom(SeriesSets,dicomViewer){
            var seriesIDList = Object.keys(SeriesSets);
              console.log(seriesIDList);
             var fileDicom=' ';
          seriesIDList.forEach(function(seriesID){
            var group = SeriesSets[seriesID];
          
            fileDicom +='<ul class="nav nav-list accordion-group" id="'+seriesID+'">';
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
            fileDicom +='  <span class="title_right" id="dicomcheckResult">结节检测中...</span>';
            fileDicom+=' </li>';
            fileDicom+=' <li class="checkProgress" id="checkProgress"><div class="checkProgressBar" id="checkProgressBar" style="width:0%;"></div></li>';
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
       document.querySelectorAll(".accordion-group").forEach(function(elem){
           elem.addEventListener('click',function(e){
                    var el = e.currentTarget;
                    console.log(el);
                    var seriesID = el.id;//获取当前Id
                     dicomViewer.setDcmSeriesInfo(SeriesSets[seriesID],[]);//调取每组第一张图片
                     initRangeSlider(dicomViewer,SeriesSets[seriesID].length);//初始化当前组的滑动条
                    var targetList = el.querySelector('.estRows');
                      // debugger;
                      var pointMsgLists = document.querySelectorAll('.estRows');
                      var pointLi = document.querySelectorAll('.nav-header');
                      console.log(pointMsgLists);
                      pointMsgLists.forEach(function(ul) {
                        (ul === targetList) ? ul.style.display = 'block' : ul.style.display ='none'; 
                      });
                      //   pointLi.forEach(function(ul) {
                      //     debugger;
                      //    (ul === pointLi) ? ul.style.border = '1px solid #fff' : ul.style.border ='none'; 
                      // });
                  
                });
       });
     
}

function pointRowMsg(obj){
      var pointMsg =' ';
      pointMsg +=' <div class="left_message_top">';
      pointMsg +='        <span><img src="img/nodepoint.png" alt="" style="width:30px;position:relative;right:10px;"><em>3</em>个节点</span>';
      pointMsg +='        <span class="nodepoint" id="pointImg"><img src="img/checkpointhide.png" alt="" style="width:30px;" id="imgChange"></span>';
      pointMsg +='</div>';
      // pointMsg +='      <div class="clear"></div>';
      pointMsg +='      <div class="nodelPointMessage">';
      pointMsg+='<div class="nodelPointMessageList">';
      pointMsg+='<div class="nodelPointMessageListTop"><span>结节'+obj.dicomImageKey +'</span><span id="delete" class="nodepoint">X</span></div>';
      pointMsg+='<div class="nodelPointMessageListBody">';
      pointMsg+='<span>直径：'+obj.diameter+'</span>';
      pointMsg+='<span>密度：'+obj. jpgImageKey+'</span>';
      pointMsg+='<span>可能性：'+obj.location+'</span>';
      pointMsg+='<span>坐标：'+obj.probability+'</span>';
      pointMsg+='</div>';

      pointMsg+='<div class="border-style border-style1"></div>';
      pointMsg+=' <div class="border-style border-style2"></div>';
      pointMsg+=' <div class="border-style border-style3"></div>';
      pointMsg+='<div class="border-style border-style4"></div>';
      pointMsg +=' </div>';
      //pointMsg +='   <div class="nodelPointMessagePage"><span class="nodePageActive upNode" id="upNode">上一个</span><span class="downNode" id="downNode">下一个</span></div>';
      document.querySelector('.left_message').innerHTML = pointMsg;
      document.getElementById("delete").addEventListener('click',function(e){
         document.querySelector('.nodelPointMessage').style.display="none";
      });

      document.getElementById("pointImg").addEventListener('click',function(e){
         showdiv();
      });
      // 上一个节点
      // document.getElementById("upNode").addEventListener('click',function(e){
        
      // });
      // //下一个节点
      // document.getElementById("downNode").addEventListener('click',function(e){
         
      // });
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





