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

function directorySelected(e) {
    const files = document.querySelector('#file01').files;
}
// 单文件选择
function fileSelected(e) {
    // var files = $("fileToUpload").files;
    var files = e.files;
    let path = [];
    for (const key in files) {
        if (files.hasOwnProperty(key)) {
            const val = files[key];
            const { webkitRelativePath } = val;
            const relativePath = webkitRelativePath.split('\/');
            relativePath.pop();
            path = new Set(relativePath)
        }
    }
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
        var id = (file.lastModifiedDate + "").replace(/\W/g, "") + size + type.replace(/\W/g, "");

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

    var txt = shtml;
    var title1 = "检测出待上传DICOM文件";
    dislog(title1, txt, btn);
    var form2 = $("form2");
    // 判断文件是否超出内存大小（存在问题）
    if (filesSize >= "9M") {

        document.getElementById("totalFiles1").style.display = "block";
        form2.addEventListener("submit", function (event) {
            event.preventDefault();
        });
    }
    else {
        document.getElementById("totalFiles1").style.display = "none";
        form2.addEventListener("submit", function (event) {
            event.preventDefault();
            uploadFile(files);
            layer.close();
        });
    }
}




function NodeTest(seriesId) {
    var queryNumber = seriesId.slice(34)
    jQuery.ajax({
        url: 'http://127.0.0.1:10219/api/ai/requestAIResult',
        data: { seriesInstanceUid: seriesId },
        success: function (data) {
            data = JSON.parse(data)
            data = data.data
            if (data.aiCode == "000000") {
                if (data.aiResults.length == '0') {
                    jQuery('#tbody' + queryNumber).html(nodeList(data.aiResults))
                    jQuery('#node' + queryNumber).html('<i style="font-size: 20px;font-style: normal;" title="' + data.aiResults.length + '个结节">' + data.aiResults.length + '</i>个结节')
                    jQuery('#node' + queryNumber).removeClass('greenGradient')
                } else {
                    jQuery('#tbody' + queryNumber).html(nodeList(data.aiResults))
                    jQuery('#node' + queryNumber).html('<i style="font-size: 20px;font-style: normal;" title="' + data.aiResults.length + '个结节">' + data.aiResults.length + '</i>个结节')
                    nodeMessage[seriesId] = data.aiResults
                    // bindNodeList(seriesId, data.aiResults, dicomViewer)
                }
            } else if (data.aiCode == '003006' || data.aiCode == '003005') {
                console.log("请求AI分析结果-分析中")
                jQuery('#tbody' + queryNumber).html(nodeList(data.aiResults))
                jQuery('#node' + queryNumber).html('结点检测中...')
                jQuery('#node' + queryNumber).removeClass('greenGradient')
                jQuery('#node' + queryNumber).removeClass('redGradient')
                setTimeout(() => {
                    NodeTest(seriesId)
                }, 5000)
            } else {
                console.log("请求AI分析结果-出现错误");
                jQuery('#tbody' + queryNumber).html(nodeList(data.aiResults))
                jQuery('#node' + queryNumber).removeClass('greenGradient')
                jQuery('#node' + queryNumber).addClass('redGradient')
                jQuery('#node' + queryNumber).html('重新检测')
                
            }
        },
        error: function () {
            console.log("请求AI分析结果-出现连接错误");
            jQuery('#node' + queryNumber).removeClass('greenGradient')
            jQuery('#node' + queryNumber).addClass('redGradient')
            jQuery('#node' + queryNumber).html('重新检测')
            jQuery('#node' + queryNumber).click(function (e) {
                e.stopPropagation();
                NodeTest(seriesId)
            })
        }
    })
}

/*canvasBtn 操作事件*/
function bindEvent(dicomViewer, firstDcmNumber) {
    jQuery('.value').html('1/' + firstDcmNumber)
    jQuery("#up").unbind('click').removeAttr('onclick').click(function (e) {
        var currentPage = jQuery('[type=range]').attr('value')
        if (currentPage <= 1) {
            return
        }
        if (currentPage > firstDcmNumber) {
            jQuery('[type=range]').attr('value', firstDcmNumber)
            return
        }
        dicomViewer.up();
        dicomViewer.clearDraw()
        dicomViewer.reset()
        currentPage--
        jQuery('[type=range]').attr('value', currentPage)
        jQuery('.value').html(currentPage + '/' + firstDcmNumber)
        initRangeSlider(dicomViewer, firstDcmNumber)
        // jQuery('.rang_width').width((91.3 / firstDcmNumber * currentPage) + "%")
    })
    jQuery("#down").unbind('click').removeAttr('onclick').click(function (e) {
        var currentPage = jQuery('[type=range]').attr('value')
        if (currentPage < 1) {
            return
        }
        if (currentPage >= firstDcmNumber) {
            jQuery('[type=range]').attr('value', firstDcmNumber)
            return
        }
        dicomViewer.clearDraw()
        dicomViewer.down();
        dicomViewer.reset()
        currentPage++
        jQuery('[type=range]').attr('value', currentPage)
        jQuery('.value').html(currentPage + '/' + firstDcmNumber)
        initRangeSlider(dicomViewer, firstDcmNumber)
        // jQuery('.rang_width').width((91.3 / firstDcmNumber * currentPage) + "%")
    })
    jQuery("#zoomin").unbind('click').removeAttr('onclick').click(function (e) {
        dicomViewer.zoomIn();
    })
    jQuery("#zoomout").unbind('click').removeAttr('onclick').click(function (e) {
        dicomViewer.zoomOut();
    })
    jQuery("#reset").unbind('click').removeAttr('onclick').click(function (e) {
        dicomViewer.reset();
    })
    initRangeSlider(dicomViewer, firstDcmNumber);
}


function initRangeSlider(dicomViewer, dcmNumber) {
    // debugger
    var elem = document.querySelector('input[type="range"]');
    elem.setAttribute("max", dcmNumber);
    // elem.removeEventListener('input');
    jQuery('[type=range]').unbind('input propertychange').removeAttr('oninput').bind('input propertychange', function () {
        var newValue = Number(this.value)
        dicomViewer.forward(newValue)
        dicomViewer.clearDraw()
        dicomViewer.reset()
        jQuery(this).attr('value', newValue)
        jQuery('.value').html(newValue + '/' + dcmNumber)
        // jQuery('.rang_width').width((91.3 / dcmNumber * newValue) + "%")
    })
}
// function initRangeSlider(dicomViewer, dcmNumber) {
//     // debugger
//     jQuery('[type=range]').attr('max',dcmNumber)
//     jQuery('.value').html(jQuery('[type=range]').attr('value') + '/' + dcmNumber)
//     // elem.removeEventListener('input');

//     var rangeValue = function () {
//         // debugger;
//         var newValue = Number(jQuery('[type=range]').attr('value'));
//         console.log(newValue)
//         dicomViewer.forward(newValue);
//         dicomViewer.clearDraw()
//         jQuery('[type=range]').attr('value', newValue)
//         jQuery('.value')[0].innerHTML = newValue + '/' + dcmNumber
//         var width = (91.3 / dcmNumber * newValue) + "%";
//         document.querySelector('.rang_width').style.width = width;
//     };
//     document.querySelector('input[type="range"]').oninput = rangeValue;
// }

function nodeList(pointsSet) {
    var dom = ''
    if (!pointsSet) {
        return
    }
    pointsSet.forEach(function (o, index) {
        dom += '<tr data-option="' + index + '"" class="point-row">'
        dom += '<td style="position:relative"><i class="currentOption" style="display:none"></i>' + (index + 1) + '</td><td>' + Number(o.diameter).toFixed(1) + '</td><td>' + Number(o.imageNo).toFixed(1) + '</td><td>' + Number(o.probability).toFixed(1) + '</td><td>'
        dom += '</tr>'
    })
    return dom
}

function bindNodeList(seriesId, pointsSet, dicomViewer) {
    document.querySelectorAll('.point-row').forEach(function (tr, index) {
        jQuery(tr).unbind('click').removeAttr('onclick').click(function (e) {
            // tr.addEventListener('click', function (e) {
            // debugger
            // if (dicomViewer.dcmSet.length <= 20) {
            //     jQuery('.box-loading').show()
            //     return
            // }
            var allOption = jQuery('.currentOption')
            for (var o in allOption) {
                allOption.eq(o).css('display', 'none')
            }
            var el = e.currentTarget;
            var currentOption = jQuery(el).children().eq(0).children().eq(0)
            currentOption.css('display', 'block')
            console.log(pointsSet)
            var targetPoint = pointsSet[jQuery(el).attr('data-option')]
            pointRowMsg(seriesId, targetPoint, index, dicomViewer, pointsSet);
            scrollNode(nodeIndex[seriesId][index], dicomViewer.dcmSet.length, dicomViewer)
            if (dicomViewer.currentDcmInfo.imagePosition === Number(targetPoint.imageNo)) {
                var drawCircle = {};
                drawCircle.diameter = targetPoint.diameter;
                drawCircle.x = targetPoint.location.slice(0, targetPoint.location.indexOf(','))
                drawCircle.y = targetPoint.location.slice(targetPoint.location.indexOf(',') + 1)
                //画节点
                dicomViewer.draw(() => { dicomViewer.drawSinglepoint(drawCircle) });
            }
            document.querySelector('.left_message').style.display = "block";
        })
    });
}
/*creat_group_list*/
function filesDicom(SeriesSets, dicomViewer,imageLength) {
    console.log(SeriesSets)
    var seriesIDList = Object.keys(SeriesSets);
    var fileDicom = '';
    seriesIDList.forEach(function (seriesID, index) {
        var group = SeriesSets[seriesID];
        fileDicom += '<ul class="nav nav-list accordion-group">';
        fileDicom += '<li class="nav-header nav-header-content" series="' + seriesID + '" title="' + seriesID.slice(34) + '">';
        fileDicom += '<div class="title_hd">';
        fileDicom += '<div style="width:68px;height:68px;background:rgba(12,173,141,0.4);position:absolute;"></div>'
        fileDicom += '     <img src="' + group[0].imageData + '" alt="" style="width:68px;margin-right:5px;display:block">';
        fileDicom += '               <span><em currentLength="'+ group.length +'">' + imageLength + '</em>张</span>';
        fileDicom += '  </div>';
        fileDicom += ' <ul class="titleMessage">';
        fileDicom += '    <li title="'+ group[0].dataSet.string('x00100020') +'"><span>'+ group[0].dataSet.string('x00100020') +'</span></li>';
        fileDicom += '    <li title="胸部CT ' + group[0].SeriesDate + '"><span>胸透CT</span><span class="leftSpacing">' + group[0].SeriesDate + '</span></li>';
        fileDicom += '    <li title="' + group[0].PersonName + ' ' + group[0].PatientSex + ' ' + group[0].PatientAge + '"><span>' + group[0].PersonName + '</span><span class="leftSpacing">' + group[0].PatientSex + '</span><span class="leftSpacing">' + group[0].PatientAge + '</span></li>';
        fileDicom += '  </ul>';
        fileDicom += '  <div class="title_right dicomcheckResult"><span id="node' + seriesID.slice(34) + '" series="' + seriesID + '" class="pingAnBtn greenGradient nodeNumber"><i style="font-size: 20px;font-style: normal;" title=0个结节">0</i>个结节</span></div>';
        fileDicom += ' </li>';
        fileDicom += ' <li class="checkProgress" ><div class="checkProgressBar" style="width:0%;"></div></li>';
        fileDicom += ' <li class="boxes estRows">';
        fileDicom += '   <table class="table tableHover" border="0">';
        fileDicom += '     <thead>';
        fileDicom += '       <tr><th>结节编号</th><th>直径/mm</th><th>层面</th><th>可能性</th></tr>';
        fileDicom += '     </thead>';
        fileDicom += '     <tbody id="tbody' + seriesID.slice(34) + '">';
        /**节点信息获取  end**/
        fileDicom += ' </tbody>';
        fileDicom += '  </table>';
        fileDicom += ' </li>';
        fileDicom += ' </ul>';
    });
    document.querySelector('.sidebar-nav').innerHTML += fileDicom;

    document.querySelectorAll(".nav-header").forEach(function (elem) {
        elem.addEventListener('click', function (e) {
            clickSeries = jQuery(this).attr('title')
            document.querySelector('.left_message').style.display = "none";
            var seriesId = jQuery(this).attr('series')
            var currentLength = jQuery(this).children('.title_hd').children().eq(2).children().attr('currentlength')
            if (currentLength == sliceNumber) {
                jQuery('.box-loading').show()
            }
            if (!imgdataObj[seriesId]) {
                dicomImage.loadDicomFiles(fileObj[seriesId]).then(function (res) {
                    console.log(res, seriesId)
                    imgdataObj[seriesId] = imgdataObj[seriesId]
                    imgdataObj[seriesId] = res[seriesId]
                    // currentLength.html(res[seriesId].length)
                    dataDicomShow(dataDicom(res[seriesId][0].dataSet));
                    nodeFilter(seriesId,res[seriesId])
                    scrollNode('1', res[seriesId].length, dicomViewer)
                    bindNodeList(seriesId, nodeMessage[seriesId], dicomViewer)
                    bindEvent(dicomViewer, res[seriesId].length);
                    dicomViewer.setDcmSeriesInfo(res[seriesId], [])
                    if (jQuery('.box-loading').css('display') !== "none") {
                        jQuery('.box-loading').hide()
                    }
                    console.log(fileObj[seriesId])
                })
            } else {
                dataDicomShow(dataDicom(imgdataObj[seriesId][0].dataSet));
                scrollNode('1', imgdataObj[seriesId].length, dicomViewer)
                bindNodeList(seriesId, nodeMessage[seriesId], dicomViewer)
                bindEvent(dicomViewer, imgdataObj[seriesId].length);
                dicomViewer.setDcmSeriesInfo(imgdataObj[seriesId], [])
            }
            // jQuery('.box-loading').show()
            //初始化数据

            // scrollNode('1', fileObj[seriesId].length, dicomViewer)
            // //绑定相应事件
            // bindEvent(dicomViewer, fileObj[seriesId].length);
            // //显示层面信息
            // dataDicomShow(dataDicom(fileObj[seriesId][0].dataSet));

            // dicomViewer.setDcmSeriesInfo(fileObj[seriesId], [])


            for (var i = 0; i < jQuery('.nav-header').length; i++) {
                jQuery('.nav-header').eq(i).removeClass('sequenceAction')
            }
            for (var o in jQuery('.currentOption')) {
                jQuery('.currentOption').eq(o).css('display', 'none')
            }
            if (!jQuery(this).hasClass('sequenceAction')) {
                jQuery(this).addClass('sequenceAction')
            } else {
                jQuery(this).removeClass('sequenceAction')
            }
            var el = e.currentTarget;
            var pointLi = jQuery(el).next().next()
            for (var i = 0; i < jQuery('.boxes').length; i++) {
                jQuery('.boxes').eq(i).slideUp()
            }
            var openStatus = jQuery(pointLi).css('display')
            if (openStatus === 'none') {
                jQuery(pointLi).slideDown()
            } else {
                jQuery(pointLi).slideUp()
            }
        });
    });
    jQuery(".nodeNumber").click(function (e) {
        e.stopPropagation()
        var seriesId = jQuery(this).attr('series')
        if (jQuery(".nodeNumber").html() == '重新检测') {
            NodeTest(seriesId)
        }
    })
}



function scrollNode(index, dcmNumber, dicomViewer) {
    dicomViewer.forward(Number(index))
    // console.log(dcmNumber)
    jQuery('[type=range]').attr('value', index)
    jQuery('.value').html(index + '/' + dcmNumber)
    // jQuery('.rang_width').width((91.3 / dcmNumber * index) + "%")
    initRangeSlider(dicomViewer, dcmNumber)
}

function pointRowMsg(seriesId, obj, index, dicomViewer, pointsSet) {
    _objLoction = 'x:' + obj.location
    _objLoction = _objLoction.replace(/(,)/, ' y:')
    var pointMsg = ' ';
    pointMsg += ' <div class="left_message_top" data-current="' + index + '">';
    pointMsg += '        <span><img src="img/nodepoint.png" alt="" style="width:23px;position:relative;right:22px;"><em class="boldFont">' + pointsSet.length + '</em>个节点</span>';
    pointMsg += '        <span class="nodepoint" id="pointImg"><img src="img/checkpointhide.png" alt="" style="width:30px;position:relative;top:-2px;" class="imgChange"></span>';
    pointMsg += '</div>';
    pointMsg += '<div class="nodelPointMessage">';
    pointMsg += '  <div class="nodelPointMessageList">';

    pointMsg += '   <div class="nodelPointMessageListTop"><span>结节 ' + (index + 1) + '</span><span id="delete" class="nodepoint" style="font-size:18px;cursor: pointer;z-index:1;line-height: 25px;">×</span></div>';

    pointMsg += '   <div class="nodelPointMessageListBody">';
    pointMsg += '    <span style="margin-top:10px;">直径：' + Number(obj.diameter).toFixed(1) + 'mm</span>';
    pointMsg += '    <span>密度：' + obj.density + 'Hu</span>';
    pointMsg += '    <span>可能性：' + Number(obj.probability).toFixed(1) + '%</span>';
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

    jQuery('#delete').click(function () {
        showdiv()
    })
    jQuery('#pointImg').click(function () {
        showdiv();
    })
    var currentMessage = jQuery('.left_message_top').attr('data-current')
    var currentIndex = currentMessage
    var allOption = jQuery('.currentOption')
    jQuery('#upNode').click(function () {
        if (currentMessage <= 0) {
            return
        }
        currentMessage--
        for (var o in allOption) {
            allOption.eq(o).css('display', 'none')
            allOption.eq(currentMessage).css('display', 'block')
        }
        pointRowMsg(seriesId, pointsSet[currentMessage], currentMessage, dicomViewer, pointsSet)
        scrollNode(nodeIndex[seriesId][currentMessage], dicomViewer.dcmSet.length, dicomViewer)
        var drawCircle = {};
        drawCircle.diameter = pointsSet[currentMessage].diameter;
        drawCircle.x = pointsSet[currentMessage].location.slice(0, pointsSet[currentMessage].location.indexOf(','))
        drawCircle.y = pointsSet[currentMessage].location.slice(pointsSet[currentMessage].location.indexOf(',') + 1)
        //画节点
        dicomViewer.draw(() => { dicomViewer.drawSinglepoint(drawCircle) });
    })
    jQuery('#downNode').click(function () {
        if (currentMessage >= pointsSet.length - 1) {
            return
        }
        currentMessage++
        for (var o in allOption) {
            allOption.eq(o).css('display', 'none')
            allOption.eq(currentMessage).css('display', 'block')
        }
        pointRowMsg(seriesId, pointsSet[currentMessage], currentMessage, dicomViewer, pointsSet)
        scrollNode(nodeIndex[seriesId][currentMessage], dicomViewer.dcmSet.length, dicomViewer)
        var drawCircle = {};
        drawCircle.diameter = pointsSet[currentMessage].diameter;
        drawCircle.x = pointsSet[currentMessage].location.slice(0, pointsSet[currentMessage].location.indexOf(','))
        drawCircle.y = pointsSet[currentMessage].location.slice(pointsSet[currentMessage].location.indexOf(',') + 1)
        //画节点
        dicomViewer.draw(() => { dicomViewer.drawSinglepoint(drawCircle) });
    })
}
/**图片切换**/
function showdiv() {
    var nodel = jQuery('.nodelPointMessage')
    var eye = jQuery('.imgChange')
    if (jQuery('.nodelPointMessage').css('display') === 'block') {
        nodel.slideUp()
        eye.attr('src', 'img/checkpointshow.png');
    } else {
        nodel.slideDown()
        eye.attr('src', 'img/checkpointhide.png');
    }
}
function preProcess(uri_path, data, isNeedEncode) {
    /*************************加密加签入参格式**********************************/
    var AK = "K8-olPawFfwd9i3Ryc4xEgJxipRS1baU3oViSTrzEetSMLFLF5P0AVPQr3Ye0i89WsKfdjNMhF7qmfL7eyWCExj0R2B3BKkoWaDCUlpT63RdpXABwH-WrBaWum5d3jR4k-QUxjAcSWxDDFqgIDDMurPIk0-vpRiAJ8TFwxuayHs";
    var SK = "Ky3x7Syyj2qzeB4MxK2pgfogFy9Z-Jpjl-l-HxnMp7oRJTh1YkyW2BQHG8jSxS744zAGFX1juAakmQZUrIjaLQJxnLyBSwpy9vSpQJSAZtX3QdJ5igC3U1YVD-iDOOCWg9pmu-dW0IxsyNJ5lI16n7odVG3QgDrfwjbHW2jppX0";
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
    var RSA = new RSAKey();
    var exponent = "10001";
    RSA.setPublic(publicKey, exponent);
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
    if (isNeedEncode) outputData.encryptedData = AESencrypt(randomString16, data);
    else outputData.data = data;
    var outputArray = [];
    processObj(outputData, outputArray);
    var resParams = trim(outputArray.sort().join('&'));
    //删除字符串中的空格
    function trim(str) {
        return str.replace(/\s/g, "");
    }
    //客户端加密数据生成的摘要
    var content_sign = sha256_digest(resParams).toUpperCase();
    outputData.sign = content_sign;

    var stringToSign = (uri_path + "," + http_verb + "," + content_sign + "," + timestamp).toString();
    // 2   根据颁发的SK计算签名字符串signature
    var signature = CryptoJS.HmacSHA1(CryptoJS.enc.Utf8.parse(stringToSign), SK);
    // 3 数据构造授权信息authorization 
    var once = hashCode(timestamp.toString(16) + outputData.deviceIp);
    var authorization = once + ":" + timestamp + ":" + AK + ":" + signature;
    // debugger;
    // base64转码
    var authorization_base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorization));
    // hash的算法
    function hashCode(str) {
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    // aes加密
    function AESencrypt(AESKey, word) {
        var key = CryptoJS.enc.Utf8.parse(AESKey);  // AESKey
        var iv = CryptoJS.enc.Utf8.parse(AESKey);   //iv和AESKey保持一致
        var encrypted = '';
        if (typeof (word) == 'string') {
            var srcs = CryptoJS.enc.Utf8.parse(word);
            encrypted = CryptoJS.AES.encrypt(srcs, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        } else if (typeof (word) == 'object') {//对象格式的转成json字符串
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
    function processObj(val, outputArray, name) {
        if (typeof val !== 'object') outputArray.push(name + '=' + val);
        else Object.keys(val).forEach(function (key) {
            processObj(val[key], outputArray, key);
        })
    }

    /********************出参格式*********************************/
    return {
        authorization: authorization_base64,
        body: outputData
    }

}


function dataDicomShow(data) {
    console.log(data.patientId)
    var direction = parseImageOrientation(data.imageOrientation)
    for (o in data) {
        if (data[o] === undefined) {
            data[o] = ''
        }
    }
    var wl = data.wc.slice(0, data.wc.indexOf('\\'))
    var ww = data.ww.slice(0, data.ww.indexOf('\\'))
    var html = ''
    html += '<ul>';
    html += '<li>WL : ' + wl + '<span>WW : ' + ww + '</span><span>T : ' + data.sliceThickness + 'MM</span></li>'
    html += '<li>Se : ' + data.seriesNumber + '<span>' + data.seriesDate + '</span><span>' + data.seriesTime + '</span></li>'
    html += '</ul>'
    jQuery('.dicom_message')[0].innerHTML = html
}

 /*上下切换结节按钮*/
