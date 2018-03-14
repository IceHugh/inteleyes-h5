var $ = function (id) {
    return document.getElementById(id)
};
/**
 * 
 * @param {} title 
 * @param {*} content 
 * @param {*} btn 
 */
function dislog(title, content, btn) {
    layer.open({
        title: title,
        type: 1,
        area: ['900px', '460px'],
        shadeClose: true, //点击遮罩关闭
        content: content,
        btnAlign: 'c', //按钮居中
        btn: btn
    });
}
function dislog1(title, content, btn) {
    layer.open({
        title: title,
        type: 1,
        area: ['640px', '320px'],
        shadeClose: true, //点击遮罩关闭
        content: content,
        btnAlign: 'c', //按钮居中
        btn: ["取消"],
        yes: function (index) {
            layer.confirm('<div class="giveUpFiles">放弃当前文件上传？</div>', {
                btn: ['放弃上传', '取消'],
                area: ['640px', '320px'],
                btnAlign: 'c' //按钮居中
            }, function (index, layero) {
                //按钮【按钮一】的回调
                layer.closeAll();
            }, function (index) {
                //按钮【按钮二】的回调
                layer.close(index);
            });
        }

    });
}

var ctheader = $("ctheader"),
    form1 = $("form1"),
    submit = $("submit"),
    fileArray = [],
    fileSplitSize = 1024 * 10000;

function directorySelected (e){
    const files = document.querySelector('#file01').files;
    console.log(files);
}
// 单文件选择
function fileSelected(e) {
    // var files = $("fileToUpload").files;
    var files = e.files;
    console.log(files);
    let path = [];
    for (const key in files) {
        if (files.hasOwnProperty(key)) {
            const val = files[key];
            const { webkitRelativePath } = val;
            const relativePath = webkitRelativePath.split('\/');
            relativePath.pop();
            console.log(relativePath)
            path = new Set(relativePath)
        }
    }
    console.log(path)
    var shtml = "";
    shtml += "<table class='table table-hover filesFilter' >";
    shtml += "<thead>";
    shtml += "<tr><th>名称</th><th>类型</th> <th>大小</th><th>时间</th></tr>";
    shtml += "</thead>";
    shtml += "<tbody>";
    //判断文件大小及文件类型 
    var total = 0;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var data = new Date().toLocaleString();
        var name = file.name;
        var size = file.size;
        var type = file.type || "";
        var fileSize = 0;
        var stuff = name.match(/^(.*)(\.)(.{1,8})$/)[3];
        console.log(stuff);
        var id = (file.lastModifiedDate + "").replace(/\W/g, "") + size + type.replace(/\W/g, "");
        console.log(id);

        //对文件类型及文件大小做判断处理
        if (stuff != "dcm") {
            alert("请选择正确文件");
            return false;
           
        }

        //名称截取
        if (name.length > 50) {
            name = name.slice(0, 10) + "..." + name.slice(- 10);
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
        shtml += "<tr><td>" + name + "</td><td>" + stuff + "</td><td>" + size + "</td><td>" + data + "</td></tr>";

        total += files[i].size;
        var filesSize = Math.round(total / (1024 * 1024) * 10) / 10 + "M";
    }
    shtml += "</tbody>";
    shtml += "</table>";
    var btnShtml = "";
    btnShtml += "<div class=\"footerBottom\">";
    btnShtml += "<p class=\"totalFiles1\"  id=\"totalFiles1\" style=\"display:none;\"><span>文件上传大小超过20M，请分次上传</span></p>"
    btnShtml += "<p class=\"totalFiles\"><span style=\"color:#666;\"><em style=\" color:#ff7000;\">" + files.length + "</em>个&nbsp;&nbsp;共<em style=\" color:#ff7000;\">" + filesSize + "</em></span></p>"
    btnShtml += "<form id=\"form2\" enctype=\"multipart/form-data\" >";
    btnShtml += "<input type=\"submit\" id=\"submit\" class=\"submitBtn\" value=\"上传并筛选\">";
    btnShtml += "</form>";
    btnShtml += "</div>";
    var btn = btnShtml;
    console.log(btn);
    
    var txt = shtml;
    var title1 = "检测出待上传DICOM文件";
    dislog(title1, txt, btn);
    var form2 = $("form2");
    // 判断文件是否超出内存大小（存在问题）
    if (filesSize >= "9M") {

        document.getElementById("totalFiles1").style.display = "block";
        form2.addEventListener("submit", function (event) {
            // debugger;
            // alert(555);
            event.preventDefault();
            // uploadFile();
        });
    }
    else {
        document.getElementById("totalFiles1").style.display = "none";
        form2.addEventListener("submit", function (event) {
            //  debugger;
            // alert(55115);
            event.preventDefault();
            uploadFile(files);
            layer.close();
        });
    }
    // 文件去重处理
    // if(fileArray.indexOf(id) != -1){
    //       console.log(fileArray.indexOf(id) != -1);
    // }else{
    //    fileArray.push(id);
    //     fileArray[id] = file
    // }
}

function uploadFile(files) {
    //定义表单变量    
    // var files = document.getElementById('fileToUpload').files;
    console.log(files);
    // var progress = document.getElementById('prog');
    // var title2 = "上传进度条";
    // var upPregress = ' ';
    // upPregress += '<div class="upload-progress"><span class="upload-son" id="uploaderprogress">DICOM文件上传中……</span></div>';
    // upPregress += '<div class="progress progressStyle">';
    // upPregress += '<div id="progressbar" class="progress-bar" style="width:0%;" role="progressbar" >0%</div>';
    // upPregress += '</div>';
    // // upPregress+='<span class=" layui-layer-close layui-layer-close1 closeBtn" >取&nbsp;&nbsp;消</span>';

    // // //  上传文件弹窗
    // dislog1(title2, upPregress);
    var SeriesSets = {};
    if (!files.length) return;
    var dicomImage = new DICOMImage();

    //  var getDcmDetail = dicomImage.getDcmDetail();

    // console.log(getDcmDetail.BodyPartExamined);
    dicomImage.loadDicomFiles(files).then(function (seriesSets) {
        var seriesId = Object.keys(seriesSets)[0];
        var dcmData = dataDicom(seriesSets[seriesId][0].dataSet);
        var dicomcheckResult = document.querySelector(".greenGradient");
        // 请求接口调用
        loopRequest({
            url: 'http://127.0.0.1:10219/api/ai/requestAIResult',
            data: {
                seriesInstanceUid: Object.keys(SeriesSets)[0]
            },
            // success: function () {
            //     dicomcheckResult.innerHTML = '<span class="complete">' + 3 + '个结节</span> ';
            //     requestAISuccess(SeriesSets) 
            // },
            success: function (data) {
                console.log("请求AI分析结果-成功");
                console.log(data);
                if (data.aiCode === '000000') {
                    dicomcheckResult.innerHTML = '<i style="font-size: 20px;font-style: normal;">'+ data.aiResults.length +'</i>个结节'
                    // dicomcheckResult.innerHTML = '<span class="complete">' + data.aiResults.length + '个结节</span> ';
                    requestAISuccess(SeriesSets, data.aiResults);
                }
            },
            loading: function () {
                console.log("请求AI分析结果-分析中")
                function setProcess() {
                    var checkProgress = document.querySelector(".checkProgress");
                    // if (checkProgressBar.style.width == "90%") return;
                    var checkProgressBar = document.querySelector(".checkProgressBar");
                    var checkProgressBarWidth = checkProgressBar.style.width;
                    checkProgressBarWidth = parseInt(checkProgressBar.style.width) + 10 + "%";
                }
                var time = setInterval(function () { setProcess(); }, 5000)
                // dicomcheckResult.innerHTML = '<span class="checking">结节检测中...</span>';
            },
            error: function () {
                console.log("请求AI分析结果-出现错误");
                // dicomcheckResult.innerHTML = '<span class="checkError"><span>出现错误</span><span onclick="requestResult(this);">重新检测</span></span>';
                
            }
        });
        console.log(seriesSets);
        // var progressbar = document.getElementById('progressbar');
        // debugger;
        // var dicomUploader = new DICOMUploader(seriesSets, {
        //     url: 'http://127.0.0.1:10219/fileupload/file',
        //     progress: function (step, res) {
        //         var percent = Math.floor(step * 100) + '%';
        //         console.log(percent);
        //         progressbar.style.width = percent;
        //         progressbar.innerHTML = percent;
        //     }
        // });
        // return dicomUploader.send();
        // return true
    })
    // .then(function (res) {
    //     /************************************************************************1判断是否为肺部影像**********************************************************************/
    //     // var seriesID = Object.keys(SeriesSets)[0];
    //     //  for(var i=0;i<= SeriesSets[seriesID].length;i++){
    //     //      var k=SeriesSets[seriesID][i] ;
    //     //      for(var j=0;j<=k;j++){

    //     //      }
    //     //     }


    //     if (false) {
    //         //k['BodyPartExamined']!== "CHEST"
    //         var dicomcheck = "您上传的文件非胸部CT，目前仅支持智能识别肺结节，请重新上传";
    //         layer.open({
    //             type: 1
    //             , content: dicomcheck
    //             , area: ['640px', '320px']
    //             , btn: '确定'
    //             , btnAlign: 'c' //按钮居中
    //             , shade: 0 //不显示遮罩
    //             , yes: function (index) {
    //                 // layer.closeAll();
    //             }
    //         });
    //     } else {

    //         var domCanvas = document.getElementById("dicomImage");
    //         // uploaderprogress.innerHTML = '100%';

    //         var dicomViewer = new DICOMViewer(domCanvas);
    //         var seriesID = Object.keys(SeriesSets)[0];
    //         // console(seriesID);
    //         // 查看器点击事件 
    //         bindEvent(dicomViewer, SeriesSets[seriesID].length);
    //         // var dicomUploader1 = new DICOMUploader(datasets);
    //         //  console.log(dicomUploader1);
    //         // 点击列表项按钮
    //         // 获取seriesID
    //         // 请求结点数据
    //         var pointsSet = [
    //             { "diameter": "30", "density": "600", "dicomImageKey": "22", "probability": "90.1", "imageNo": "-360.5", "location": "180,303", "jpgImageKey": "22" },
    //             { "diameter": "15", "density": "400", "dicomImageKey": "11", "probability": "98.9", "imageNo": "-360.5", "location": "100,234", "jpgImageKey": "11" },
    //             { "diameter": "30", "density": "300", "dicomImageKey": "22", "probability": "90.1", "imageNo": "-360.5", "location": "280,83", "jpgImageKey": "22" },
    //             { "diameter": "15", "density": "500", "dicomImageKey": "11", "probability": "98.9", "imageNo": "-360.5", "location": "300,134", "jpgImageKey": "11" },
    //             { "diameter": "15", "density": "400", "dicomImageKey": "11", "probability": "98.9", "imageNo": "-196.5", "location": "100,234", "jpgImageKey": "11" },
    //             { "diameter": "25", "density": "400", "dicomImageKey": "11", "probability": "98.9", "imageNo": "-196.5", "location": "250,450", "jpgImageKey": "11" }
    //         ];
    //         dicomViewer.setDcmSeriesInfo(SeriesSets[seriesID], pointsSet);
    //         filesDicom(SeriesSets, dicomViewer);
    //         Object.keys(SeriesSets).forEach(function(seriesID) {
    //             requestResult({
    //                 url: 'http://127.0.0.1:10219/api/ai/requestAIResult',
    //                 handleResponse: requestAI_handleResponse,
    //                 data: {
    //                     serialInstanceUid: seriesID
    //                 }
    //             });
    //         });
    //         // dislog('','上传成功');
    //         var page1 = document.getElementById("page1");
    //         var page2 = document.getElementById("page2");
    //         page1.style.display = "none";
    //         page2.style.display = "block";
    //         // layer.closeAll();
    //     }
    // }).catch(function (err) {
    //     console.log(err || '失败')
    //     var offline = "<div class=\"offline\">网络中断，待网络正常后继续上传</div>";
    //     // layer.close();
    //     layer.open({
    //         type: 1
    //         , content: offline
    //         , area: ['640px', '320px']
    //         , btn: '确定'
    //         , btnAlign: 'c' //按钮居中
    //         , shade: 0 //不显示遮罩
    //         , yes: function (index) {
    //             // layer.close(index);
    //         }
    //     });
    // });
}
function requestAISuccess(seriesSets, pointsSet) {
    // var dicomcheckResult = document.querySelector(".dicomcheckResult");
    if (seriesSets == undefined) {
        //k['BodyPartExamined']!== "CHEST"
        var dicomcheck = "您上传的文件非胸部CT，目前仅支持智能识别肺结节，请重新上传";
        layer.open({
            type: 1
            , content: dicomcheck
            , area: ['640px', '320px']
            , btn: '确定'
            , btnAlign: 'c' //按钮居中
            , shade: 0 //不显示遮罩
            , yes: function (index) {
                // layer.closeAll();
            }
        });
    } else {
        var domCanvas = document.getElementById("dicomImage");
        // uploaderprogress.innerHTML = '100%';

        var dicomViewer = new DICOMViewer(domCanvas);
        console.log(seriesSets)
        var seriesID = Object.keys(seriesSets)[0];
        // console(seriesID);
        // 查看器点击事件 
        bindEvent(dicomViewer, seriesSets[seriesID].length);
        // var dicomUploader1 = new DICOMUploader(datasets);
        //  console.log(dicomUploader1);
        // 点击列表项按钮
        // 获取seriesID
        // 请求结点数据
        // var pointsSet = [
        //     { "diameter": "30", "density": "600", "dicomImageKey": "22", "probability": "90.1", "imageNo": "-360.5", "location": "180,303", "jpgImageKey": "22" },
        //     { "diameter": "15", "density": "400", "dicomImageKey": "11", "probability": "98.9", "imageNo": "-360.5", "location": "100,234", "jpgImageKey": "11" },
        //     { "diameter": "30", "density": "300", "dicomImageKey": "22", "probability": "90.1", "imageNo": "-360.5", "location": "280,83", "jpgImageKey": "22" },
        //     { "diameter": "15", "density": "500", "dicomImageKey": "11", "probability": "98.9", "imageNo": "-360.5", "location": "300,134", "jpgImageKey": "11" },
        //     { "diameter": "15", "density": "400", "dicomImageKey": "11", "probability": "98.9", "imageNo": "-196.5", "location": "100,234", "jpgImageKey": "11" },
        //     { "diameter": "25", "density": "400", "dicomImageKey": "11", "probability": "98.9", "imageNo": "-196.5", "location": "250,450", "jpgImageKey": "11" }
        // ];
        dicomViewer.setDcmSeriesInfo(seriesSets[seriesID], pointsSet);
        filesDicom(seriesSets, pointsSet, dicomViewer);
    }
}
/*canvasBtn 操作事件*/
function bindEvent(dicomViewer, firstDcmNumber) {
    document.getElementById('up').addEventListener('click', function (e) {
        var currentPage = document.querySelector('input[type="range"]')
        if(currentPage.value <= 1) {
            return 
        }
        if(currentPage.value > firstDcmNumber) {
            currentPage.setAttribute('value', firstDcmNumber)
            return
        }
        dicomViewer.up();
        dicomViewer.clearDraw()
        currentPage.setAttribute('value', currentPage.value--)
        jQuery('.value')[0].innerHTML = currentPage.value + '/' + firstDcmNumber
        
    });
    document.getElementById('down').addEventListener('click', function (e) {
        var currentPage = document.querySelector('input[type="range"]')
        if(currentPage.value < 1) {
            return
        }
        if(currentPage.value >= firstDcmNumber) {
            currentPage.setAttribute('value', firstDcmNumber)
            return
        }
        dicomViewer.clearDraw()
        dicomViewer.down();
        currentPage.setAttribute('value', currentPage.value++)
        
        jQuery('.value')[0].innerHTML = currentPage.value + '/' + firstDcmNumber
    });
    document.getElementById('zoomin').addEventListener('click', function (e) {
        dicomViewer.zoomIn();
    });
    document.getElementById('zoomout').addEventListener('click', function (e) {
        dicomViewer.zoomOut();
    });
    document.getElementById('reset').addEventListener('click', function (e) {
        dicomViewer.reset();
    });
    dicomViewer.setPointEvent(function (point) {

    });
    initRangeSlider(dicomViewer, firstDcmNumber);
}

/** rangeSlider **/

function initRangeSlider(dicomViewer, dcmNumber) {
    // debugger
    var elem = document.querySelector('input[type="range"]');
    elem.setAttribute("max", dcmNumber);
    jQuery('.value')[0].innerHTML = elem.value + '/' + dcmNumber
    // elem.removeEventListener('input');
    var rangeValue = function () {
        // debugger;
        var newValue = Number(elem.value);
        dicomViewer.forward(newValue -1);
        dicomViewer.clearDraw()
        elem.setAttribute('value', newValue)
        jQuery('.value')[0].innerHTML = newValue+ '/' + dcmNumber
        var width = (91.3 / dcmNumber * newValue) + "%";
        document.querySelector('.rang_width').style.width = width;
    };

    elem.oninput = rangeValue;

}

/************************************************************************2请求AI接口结果，是否发起轮询**********************************************************************/
function requestResultGetResult(options) {
    var xhr = new XMLHttpRequest();
    var url = options.url;

    xhr.onreadystatechange = function() {
        options.handleResponse(xhr,options);
    }

    xhr.open("GET", url + "?seriesInstanceUid=" + options.data.seriesInstanceUid);
    xhr.send(null);
}

function requestResult(options) {
    var xhr = new XMLHttpRequest();
    var url = options.url;
    /************************************************************************3没有做数据处理**********************************************************************/
    xhr.onreadystatechange = function() {
        options.handleResponse(xhr,options);
    }
    var processRes = preProcess(url,options.data,true);
    xhr.open("POST", options.url, true);
     // 请求头部信息设置
    xhr.setRequestHeader('Authorization',  processRes.authorization);
    xhr.send(JSON.stringify(processRes.body));
}
function requestAI_handleResponse(xhr,options) {
    var dicomcheckResult = document.querySelector(".dicomcheckResult");
    if (xhr.readyState == 4 && xhr.status == 200) {
        var requestAIRes =JSON.stringify(xhr.responseText);
        var url = "http://127.0.0.1:10219/api/ai/requestAIResult"
        // var data = { seriesInstanceUid: seriesInstanceUid };
        if(requestAIRes.code !== "000000") return;
        loopRequest({
            url: url,
            data: options.data,
            success: function () {
                dicomcheckResult.innerHTML = '<span class="complete">' + 3 + '个结节</span> ';
            },
            loading: function () {
                function setProcess() {
                    // debugger;
                    var checkProgress = document.querySelector(".checkProgress");
                    // if (checkProgressBar.style.width == "90%") return;
                    var checkProgressBar = document.querySelector(".checkProgressBar");
                    var checkProgressBarWidth = checkProgressBar.style.width;
                    checkProgressBarWidth = parseInt(checkProgressBar.style.width) + 10 + "%";;
                }
                var time = setInterval(function () { setProcess(); }, 5000)
                dicomcheckResult.innerHTML = '<span class="checking">结节检测中...</span>';
            },
            error: function () {
                dicomcheckResult.innerHTML = '<span class="checkError"><span>出现错误</span><span onclick="requestResult(this);">重新检测</span></span>';

            }
        });
    }
}
/*请求成功时，轮询*/
function loopRequest(options) {
    requestResultGetResult({
        url: options.url,
        data: options.data,
        handleResponse: requestAIResult_handleResponse
    });
    //请求成功时
    function requestAIResult_handleResponse(xhr) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // debugger;
            var res = xhr.responseText;
            if (res) {
                res = JSON.parse(res);
                if (res["code"] == "000000") {
                    options.success(res.data);
                } else if (res["code"] == "003005" || res["code"] == "003006") {
                    options.loading();
                    setTimeout(function () { loopRequest(options); }, 30000);
                } else {
                    options.error();
                }

            } else {
                options.error();
            }
        } else {
            options.error();
        };
    }
}
/*creat_group_list*/
function filesDicom(SeriesSets, pointsSet, dicomViewer) {
    var seriesIDList = Object.keys(SeriesSets);
    console.log(seriesIDList);
    var fileDicom = '';
    seriesIDList.forEach(function (seriesID) {
        var group = SeriesSets[seriesID];
        var dom = ''
        fileDicom += '<ul class="nav nav-list accordion-group" id="' + seriesID + '">';
        fileDicom += '<li class="nav-header nav-header-content sequenceAction">';
        fileDicom += '<div class="title_hd">';
        fileDicom += '<div style="width:68px;height:68px;background:rgba(12,173,141,0.4);position:absolute;"></div>'
        fileDicom += '     <img src="' + group[0].imageData + '" alt="" style="width:68px;margin-right:5px;display:block">';
        fileDicom += '               <span><em>' + group.length + '</em>张</span>';
        fileDicom += '  </div>';
        
        fileDicom += ' <ul class="titleMessage">';
        fileDicom += '    <li title="SX_001"><span>SX_001</span></li>';
        fileDicom += '    <li title="胸部CT '+ group[0].SeriesDate +'"><span>胸透CT</span><span class="leftSpacing">' + group[0].SeriesDate + '</span></li>';
        fileDicom += '    <li title="'+ group[0].PersonName + ' ' +group[0].PatientSex + ' ' + group[0].PatientAge +'"><span>' + group[0].PersonName + '</span><span class="leftSpacing">' + group[0].PatientSex + '</span><span class="leftSpacing">' + group[0].PatientAge + '</span></li>';
        fileDicom += '  </ul>';

        fileDicom += '  <div class="title_right dicomcheckResult"><span class="pingAnBtn greenGradient nodeNumber"><i style="font-size: 20px;font-style: normal;">8</i>个结节</span></div>';
        fileDicom += ' </li>';
        fileDicom += ' <li class="checkProgress" ><div class="checkProgressBar" style="width:0%;"></div></li>';
        fileDicom += ' <li style="display:block;" class="boxes estRows">';
        fileDicom += '   <table class="table tableHover" border="0">';
        fileDicom += '     <thead>';    
        fileDicom += '       <tr><th>结节编号</th><th>直径/mm</th><th>层面</th><th>可能性</th></tr>';
        fileDicom += '     </thead>';
        fileDicom += '     <tbody>';
        console.log(pointsSet)
        pointsSet.forEach(function(o,index){
            dom += '<tr data-option="' + index + '"" class="point-row">'
            dom += '<td style="position:relative"><i class="currentOption" style="display:none"></i>' + o.jpgImageKey + '</td><td>' + o.diameter + '</td><td>' + o.imageNo + '</td><td>' + o.probability + '</td><td>'
            dom += '</tr>'
        })  
        fileDicom += dom
        /**节点信息获取  end**/
        fileDicom += ' </tbody>';
        fileDicom += '  </table>';
        fileDicom += ' </li>';
        fileDicom += ' </ul>';
    });

    document.querySelector('.sidebar-nav').innerHTML += fileDicom;
    /*节点操作控制*/
    document.querySelectorAll('.point-row').forEach(function (tr,index) {
        tr.addEventListener('click', function (e) {
            // debugger
            var allOption = jQuery('.currentOption')
            for (var o in allOption) {
                allOption.eq(o).css('display','none')
            }
            var el = e.currentTarget;
            var currentOption = jQuery(el).children().eq(0).children().eq(0)
            currentOption.css('display','block')
            // var targetPoint = pointsSet.filter(function (point) {
            //     return jQuery(el).attr('data-option') === point.location;
            // })[0];
            var targetPoint = pointsSet[jQuery(el).attr('data-option')]
            pointRowMsg(targetPoint,index,dicomViewer);
            if (dicomViewer.currentDcmInfo.imagePosition === Number(targetPoint.imageNo)) {
            var drawCircle = {};
            drawCircle.diameter = targetPoint.diameter;
            drawCircle.x = targetPoint.location.slice(0,targetPoint.location.indexOf(','))
            drawCircle.y = targetPoint.location.slice(targetPoint.location.indexOf(',') + 1)
            //画节点
            dicomViewer.draw(() => {dicomViewer.drawSinglepoint(drawCircle)});
            }
            document.querySelector('.left_message').style.display = "block";
        })
    });
   
    /*下拉菜单切换*/
    document.querySelectorAll(".nav-header").forEach(function (elem) {
        
        elem.addEventListener('click', function (e) {
            if(!jQuery(this).hasClass('sequenceAction')){
                jQuery(this).addClass('sequenceAction')
            }else{
                jQuery(this).removeClass('sequenceAction')
            }
            var el = e.currentTarget;
            var pointLi = jQuery(el).next().next()
            // var seriesID = el.id;//获取当前Id
            // dicomViewer.setDcmSeriesInfo(SeriesSets[seriesID], []);//调取每组第一张图片
            // initRangeSlider(dicomViewer, SeriesSets[seriesID].length);//初始化当前组的滑动条
            // var pointLi = document.querySelectorAll('.nav-header');
            var openStatus = jQuery(pointLi).css('display')
            if (openStatus === 'none') {
                jQuery(pointLi).slideDown()
            } else {
                jQuery(pointLi).slideUp()
            }
            //   pointLi.forEach(function(ul) {
            //     debugger;
            //    (ul === pointLi) ? ul.style.border = '1px solid #fff' : ul.style.border ='none'; 
            // });

        });
    });

}

function pointRowMsg(obj,index,dicomViewer) {
    _objLoction ='x:'+ obj.location
    _objLoction = _objLoction.replace(/(,)/,' y:')
    var pointMsg = ' ';
    pointMsg += ' <div class="left_message_top" data-current="'+ index +'">';
    pointMsg += '        <span><img src="img/nodepoint.png" alt="" style="width:23px;position:relative;right:22px;"><em class="boldFont">' + 3 + '</em>个节点</span>';
    pointMsg += '        <span class="nodepoint" id="pointImg"><img src="img/checkpointhide.png" alt="" style="width:30px;position:relative;top:-2px;" id="imgChange"></span>';
    pointMsg += '</div>';
    pointMsg += '<div class="nodelPointMessage">';
    pointMsg += '  <div class="nodelPointMessageList">';

    pointMsg += '   <div class="nodelPointMessageListTop"><span>结节' + obj.dicomImageKey + '</span><span id="delete" class="nodepoint" style="font-size:18px;cursor: pointer;z-index:1;line-height: 25px;">×</span></div>';

    pointMsg += '   <div class="nodelPointMessageListBody">';
    pointMsg += '    <span style="margin-top:10px;">直径：' + obj.diameter + 'mm</span>';
    pointMsg += '    <span>密度：' + obj.jpgImageKey + 'Hu</span>';
    pointMsg += '    <span>可能性：' + obj.probability + '%</span>';
    pointMsg += '    <span>坐标：' + _objLoction + '</span>';
    pointMsg += '   </div>';

    pointMsg += '   <div class="border-style border-style1"></div>';
    pointMsg += '   <div class="border-style border-style2"></div>';
    pointMsg += '   <div class="border-style border-style3"></div>';
    pointMsg += '   <div class="border-style border-style4"></div>';
    pointMsg += '  </div>';
    pointMsg += ' <div style="margin-top:15px;"><input type="button" class="upDownbtn" value="上一个" id="upNode"><input type="button" style="margin-left:10px;" class="upDownbtn" value="下一个" id="downNode"></div>'
    pointMsg += '</div>'
    document.querySelector('.left_message').innerHTML = pointMsg;

    jQuery('#delete').click(function(){
        showdiv()
    })
    jQuery('#pointImg').click(function(){
        showdiv();
    })
    var currentMessage = jQuery('.left_message_top').attr('data-current')
    var allOption = jQuery('.currentOption')
    jQuery('#upNode').click(function(){
        if(currentMessage <= 0) {
            return
        }
        currentMessage--
        for (var o in allOption) {
            allOption.eq(o).css('display','none')
            allOption.eq(currentMessage).css('display','block')
        }
        pointRowMsg(pointsSet[currentMessage],currentMessage,dicomViewer)
        console.log(dicomViewer.currentDcmInfo.imagePosition,obj.imageNo)
        if (dicomViewer.currentDcmInfo.imagePosition === Number(obj.imageNo)) {
            var drawCircle = {};
            console.log(pointsSet[currentMessage])
            drawCircle.diameter = pointsSet[currentMessage].diameter;
            drawCircle.x = pointsSet[currentMessage].location.slice(0,pointsSet[currentMessage].location.indexOf(','))
            drawCircle.y = pointsSet[currentMessage].location.slice(pointsSet[currentMessage].location.indexOf(',') + 1)
            //画节点
            dicomViewer.draw(() => {dicomViewer.drawSinglepoint(drawCircle)});
        }
        
    })
    jQuery('#downNode').click(function(){
        if(currentMessage >= pointsSet.length-1) {
            return
        }
        currentMessage++
        for (var o in allOption) {
            allOption.eq(o).css('display','none')
            allOption.eq(currentMessage).css('display','block')
        }
        pointRowMsg(pointsSet[currentMessage],currentMessage,dicomViewer)
        console.log(dicomViewer.currentDcmInfo.imagePosition,obj.imageNo)
        if (dicomViewer.currentDcmInfo.imagePosition === Number(obj.imageNo)) {
            var drawCircle = {};
            drawCircle.diameter = pointsSet[currentMessage].diameter;
            drawCircle.x = pointsSet[currentMessage].location.slice(0,pointsSet[currentMessage].location.indexOf(','))
            drawCircle.y = pointsSet[currentMessage].location.slice(pointsSet[currentMessage].location.indexOf(',') + 1)
            //画节点
            dicomViewer.draw(() => {dicomViewer.drawSinglepoint(drawCircle)});
        }
    })
}
/**图片切换**/
function showdiv() {
    var nodel = jQuery('.nodelPointMessage')
    var eye = jQuery('.imgChange')
    if(jQuery('.nodelPointMessage').css('display') === 'block') {
        nodel.slideUp()
        eye.src = "img/checkpointhide.png";
    } else {
        nodel.slideDown()
        eye.src = 'img/checkpointshow.png';
    }
}
function preProcess(uri_path,data,isNeedEncode) {
    /*************************加密加签入参格式**********************************/
    var AK="K8-olPawFfwd9i3Ryc4xEgJxipRS1baU3oViSTrzEetSMLFLF5P0AVPQr3Ye0i89WsKfdjNMhF7qmfL7eyWCExj0R2B3BKkoWaDCUlpT63RdpXABwH-WrBaWum5d3jR4k-QUxjAcSWxDDFqgIDDMurPIk0-vpRiAJ8TFwxuayHs";
    var SK="Ky3x7Syyj2qzeB4MxK2pgfogFy9Z-Jpjl-l-HxnMp7oRJTh1YkyW2BQHG8jSxS744zAGFX1juAakmQZUrIjaLQJxnLyBSwpy9vSpQJSAZtX3QdJ5igC3U1YVD-iDOOCWg9pmu-dW0IxsyNJ5lI16n7odVG3QgDrfwjbHW2jppX0";
    // 时间戳(时区GMT+8)
    var timestamp = new Date().getTime() + 28800;
    /***************签名字符串******************/
    var http_verb = "POST";
    /**********接口入参加密加签***************/
    var publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCDWHotgLlIDhEQzjECR3rAZKk-IksiWDNVtD8RUi89skU_H1oF82YXbfMlxXsGvpLU87Q06GDvyID7EfJe2EgGiaOhJQE5slmFgSPHIIa1xodtnuOoKPbZnksNgGZlQlK7hA-oJvUgnkfZiOk9AtBZgiyP8ohNE7cfcoj0edK_FQIDAQAB"; //颖像平台下发的publicKey
    // 随机产生16位字符串
    function randomWord(randomFlag, min, max) {
        var str = "",
            range = min,
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        if (randomFlag) {
            range = Math.round(Math.random() * (max - min)) + min;
        }
        for (var i = 0; i < range; i++) {
            pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    }
    var randomString16 = randomWord(false, 16); // 一般key为一个字符串 
    // rsa加密
    var RSA=new RSAKey();
    var exponent = "10001";
    RSA.setPublic(publicKey,exponent);
    var encodeKey = RSA.encrypt(randomString16);
    // 入参格式
    var outputData = {
        "institutionId": "00000100000000000001",
        "channelId": "0000010000",
        "requestId": "20150701083030-10011001-0001",
        "encodeKey": encodeKey,
        // "sign": content_sign,
        "signMethod": "sha256",
        "timestamp ": timestamp,
        "version": "1.0",
        "deviceId": "30BB7E0A5E2D",
        "deviceIp": "10.0.0.1",
    }
    if (isNeedEncode) outputData.encryptedData =  AESencrypt(randomString16,data);
    else outputData.data = data;
    var outputArray = [];
    processObj(outputData,outputArray);
    var resParams =trim(outputArray.sort().join('&'));
    //删除字符串中的空格
    function trim(str){
        return str.replace(/\s/g,"");
    }
    //客户端加密数据生成的摘要
    var content_sign = sha256_digest(resParams).toUpperCase();
    outputData.sign = content_sign;

    var stringToSign =( uri_path + "," + http_verb + "," + content_sign + "," + timestamp).toString();
    console.log(stringToSign);
    // 2   根据颁发的SK计算签名字符串signature
    var signature = CryptoJS.HmacSHA1(CryptoJS.enc.Utf8.parse(stringToSign), SK);
    console.log(signature);
    // 3 数据构造授权信息authorization 
    var once = hashCode(timestamp.toString(16) + outputData.deviceIp);
    var authorization = once + ":" + timestamp + ":" + AK + ":" + signature;
    // debugger;
    // base64转码
    var authorization_base64 = CryptoJS.enc.Base64.stringify( CryptoJS.enc.Utf8.parse(authorization));
    // hash的算法
    function hashCode(str){
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    // aes加密
    function AESencrypt(AESKey,word) {
        var key = CryptoJS.enc.Utf8.parse(AESKey);  // AESKey
        var iv = CryptoJS.enc.Utf8.parse(AESKey);   //iv和AESKey保持一致
        var encrypted = '';
        if (typeof(word) == 'string') {
            var srcs = CryptoJS.enc.Utf8.parse(word);
            encrypted = CryptoJS.AES.encrypt(srcs, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        } else if (typeof(word) == 'object') {//对象格式的转成json字符串
            data = JSON.stringify(word);
            var srcs = CryptoJS.enc.Utf8.parse(data);
            encrypted = CryptoJS.AES.encrypt(srcs, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            })
        }
        return encrypted.ciphertext.toString();
    }
    function processObj(val,outputArray,name) {
        if (typeof val !== 'object') outputArray.push(name + '=' + val);
        else Object.keys(val).forEach(function(key){
            processObj(val[key],outputArray,key);
        })
    }

    /********************出参格式*********************************/
    return {
        authorization: authorization_base64,
        body: outputData
    }

}


function dataDicomShow(data){
    var direction = parseImageOrientation(data.imageOrientation)
    for (o in data){
        if(data[o] === undefined) {
            data[o] = ''
        }
    }
    var wl = data.wc.slice(0,data.wc.indexOf('\\'))
    var ww = data.ww.slice(0,data.ww.indexOf('\\'))
    var html = ''
    html += '<ul>';
    html += '<li>WL : '+ wl +'<span>WW : '+ ww +'</span><span>T : '+ data.sliceThickness +'MM</span></li>'
    html += '<li>Se : '+ data.seriesNumber +'<span>'+ data.seriesDate +'</span><span>'+ data.seriesTime +'</span></li>'
    html += '</ul>'
    jQuery('.dicom_message')[0].innerHTML = html
}

 /*上下切换结节按钮*/
