var pathList = [];
var fileList = [];
var nodeMessage = [];
var nodeIndex = [];
var fileObj = {};
var imgdataObj = {}
var clickDraw = []
var sliceNumber = 20;
var clickSeries = ''
var page1 = document.getElementById('page1')
var page2 = document.getElementById('page2')
var domCanvas = document.getElementById("dicomImage");
var dicomViewer = new DICOMViewer(domCanvas);
var dicomImage = new DICOMImage();
function directorySelect(e) {
  var files = e.files;
  pathList = [];
  fileList = [];
  var dcmFileList = []; // 过滤其他非dcm后缀的文件
  for (const key in files) {
    if (files.hasOwnProperty(key)) {
      var val = files[key];
      if (val.name.match(/\.dcm/)) {
        dcmFileList.push(val);
        const { webkitRelativePath } = val;
        const pathArr = webkitRelativePath.split('\/');
        const relativePath = pathArr[pathArr.length - 2];
        if (pathList.indexOf(relativePath) < 0) {
          pathList.push(relativePath);
        }
        if (!fileObj[relativePath]) {
          fileObj[relativePath] = [val];
          nodeIndex[relativePath] = [val]
        } else {
          fileObj[relativePath].push(val)
          nodeIndex[relativePath] = []
        }
        fileList.push(val);
      }
    }
  }
  // console.log(fileList)
  //showDir(pathList);
  for (var item in fileObj) {
    showImages(fileObj[item])
  }
}

// function showDir(list) {
//   var page1 = document.getElementById("page1");
//   var page2 = document.getElementById("page2");
//   page1.style.display = "none";
//   page2.style.display = "block";
//   var html = '';
//   list.forEach(val => {
//     html += `<div class="dir-item" onclick="test(this)">${val}</div>`;
//   });
//   const dirDom = document.getElementById('jsdir');
//   dirDom.innerHTML = html;
// }



function showImages(dcmFiles) {
  var _dcmFiles = dcmFiles.slice(0)
  page1.style.display = 'none';
  page2.style.display = 'block';
  var SeriesSets = {};
  var seriesId = ''
  var pointsSet = []
  if (_dcmFiles.length > sliceNumber) {
    _dcmFiles.splice(sliceNumber)
    dicomImage.loadDicomFiles(_dcmFiles).then(function (res) {
      seriesId = Object.keys(res)[0];
      NodeTest(seriesId)
      dataDicomShow(dataDicom(res[seriesId][0].dataSet));
      filesDicom(res, dicomViewer,dcmFiles.length)
      bindEvent(dicomViewer, res[seriesId].length);
      dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet);

      //第2次请求
      // drawDicomData(_dcmFiles, dicomImage).then(res => {
      //   fileObj[seriesId] = res[seriesId]
      //   nodeFilter(seriesId, res[seriesId])
      //   bindNodeList(seriesId, nodeMessage[seriesId], dicomViewer)
      //   // dicomViewer.setDcmSeriesInfo(res.item, pointsSet)
      //   // reviseData(dicomViewer, res.item.length)
      //   // nodeFilter(res.item)
      //   if (jQuery('.box-loading').css('display') !== "none") {
      //     jQuery('[title='+ clickSeries +']').click()
      //     // jQuery('.box-loading').hide()
      //   }
      // })
      
    })
  } else {
    dicomImage.loadDicomFiles(dcmFiles).then(function (res) {
      seriesId = Object.keys(res)[0];
      NodeTest(seriesId)
      dataDicomShow(dataDicom(res[seriesId][0].dataSet));
      filesDicom(res, dicomViewer)
      bindEvent(dicomViewer, res[seriesId].length);
      dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet);
    })
  }
}
function nodeFilter(imgdata, imageNo) {
  if(imgdata == undefined){
    return
  }
  return imgdata.findIndex( x => {
    return Math.abs(x.imageNo - 0) == Math.abs(imageNo - 0 )
  })
  // if (nodeMessage[seriesId].length) {
  //   nodeMessage[seriesId].forEach(c => {
  //     imgdata.map((item, index) => {
  //       if (item.imageNo == c.imageNo) {
  //         return index
  //       }
  //     })
  //   })
  // };
}
async function drawDicomData(dcmFiles, dicomImage) {
  var analyticData = [];
  await dicomImage.loadDicomFiles(dcmFiles).then(res => {

    analyticData = res
  })
  return analyticData
}

// function test(e) {
//   console.log();
//   const relativePath = e.innerText;
//   const selectFileList = fileList.filter( val => {
//     return val.webkitRelativePath.match(relativePath);
//   });
//   console.log(selectFileList);
//   uploadFile(selectFileList)
// }
