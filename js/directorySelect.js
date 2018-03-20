var pathList = [];
var fileList = [];
var nodeMessage = [];
var nodeIndex = [];
var fileObj = {}
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
        } else {
          fileObj[relativePath].push(val)
        }
        fileList.push(val);
      }
    }
  }
  console.log(fileObj)
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
  var page1 = document.getElementById('page1')
  var page2 = document.getElementById('page2')
  page1.style.display = 'none';
  page2.style.display = 'block';
  var domCanvas = document.getElementById("dicomImage");
  var dicomViewer = new DICOMViewer(domCanvas);
  var dicomImage = new DICOMImage();
  var SeriesSets = {};
  var seriesId = ''
  var pointsSet = []
  if (dcmFiles.length > 20) {
    dcmFiles.splice(20)
    dicomImage.loadDicomFiles(dcmFiles).then(function (res) {
      seriesId = Object.keys(res)[0];
      NodeTest(seriesId, dicomViewer, res)
      dataDicomShow(dataDicom(res[seriesId][0].dataSet));
      filesDicom(res, dicomViewer)
      bindEvent(dicomViewer, res[seriesId].length);
      dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet);
      //第2次请求
      // drawDicomData(_dcmFiles, dicomImage).then(res => {
      //   dicomViewer.setDcmSeriesInfo(res.item, pointsSet)
      //   reviseData(dicomViewer, res.item.length)
      //   nodeFilter(res.item)
      //   if (jQuery('.box-loading').css('display') !== "none") {
      //     jQuery('.box-loading').hide()
      //   }
      // })
    })
  } else {
    dicomImage.loadDicomFiles(dcmFiles).then(function (res) {
      seriesId = Object.keys(res)[0];
      NodeTest(seriesId, dicomViewer, res)
      dataDicomShow(dataDicom(res[seriesId][0].dataSet));
      filesDicom(res, dicomViewer)
      bindEvent(dicomViewer, res[seriesId].length);
      dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet);

      // drawDicomData(_dcmFiles, dicomImage).then(res => {
      //   dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet)
      //   reviseData(dicomViewer, res[seriesId].length)
      //   nodeFilter(res[seriesId])
      //   if (jQuery('.box-loading').css('display') !== "none") {
      //     jQuery('.box-loading').hide()
      //   }
      // })
    })
  }
}
function nodeFilter(imgdata) {
  console.log(nodeMessage)
  if (nodeMessage.length) {
    nodeMessage[0].forEach(c => {
      imgdata.map((item, index) => {
        if (item.imageNo == c.imageNo) {
          nodeIndex.push(index)
        }
      })
    })
  };
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
