var pathList = [];
var fileList = [];
function directorySelect(e) {
  var files = e.files;
  console.log(files);
  pathList = [];
  fileList = [];
  var dcmFileList = []; // 过滤其他非dcm后缀的文件
  for (const key in files) {
    if (files.hasOwnProperty(key)) {
      var val = files[key];
      if(val.name.match(/\.dcm/)) {
        dcmFileList.push(val);
        const { webkitRelativePath } = val;
        const pathArr = webkitRelativePath.split('\/');
        const relativePath = pathArr[pathArr.length - 2];
        if (pathList.indexOf(relativePath) < 0) {
          pathList.push(relativePath);
        }
        fileList.push(val);
      }
    }
  }
  // console.log(pathList)
  // console.log(fileList)
  console.log(dcmFileList);
  //showDir(pathList);
  showImages(dcmFileList);
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
  var page1 = document.getElementById('page1')
  var page2 = document.getElementById('page2')
  page1.style.display = 'none';
  page2.style.display = 'block';
  var domCanvas = document.getElementById("dicomImage");
  var dicomViewer = new DICOMViewer(domCanvas);
  var lazyArr = [];
  var lazyData = [];
  var dicomImage = new DICOMImage();
  var SeriesSets = {};
  var seriesId = ''

  if(dcmFiles.length > 20) {
    lazyArr = dcmFiles.splice(20)
  }
  
  dicomImage.loadDicomFiles(dcmFiles).then(function (res) {
    seriesId = Object.keys(res)[0];
    lazyData = res[seriesId]
    var dcmData = dataDicom(res[seriesId][0].dataSet);
    dataDicomShow(dcmData);
    bindEvent(dicomViewer, res[seriesId].length);
    dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet);
    filesDicom(res, pointsSet, dicomViewer);
    closureDicom(lazyArr,dicomImage,lazyData,seriesId,dicomViewer)
  })
}
function closureDicom(arr,dicomImage,lazyData,seriesId,dicomViewer) {
  console.log(lazyData)
  if(arr.length > 20) {
    var closureArr = arr.splice(20)
    console.log(dicomImage)
    dicomImage.loadDicomFiles(arr).then(function (res) {
      lazyData = lazyData.concat(res[seriesId])
      bindEvent(dicomViewer, lazyData.length);
      dicomViewer.setDcmSeriesInfo(lazyData, pointsSet);
      closureDicom(closureArr,dicomImage,lazyData,seriesId,dicomViewer)
    })
  } else {
    dicomImage.loadDicomFiles(arr).then(function (res) {
      lazyData = lazyData.concat(res[seriesId])
      bindEvent(dicomViewer, lazyData.length);
      dicomViewer.setDcmSeriesInfo(lazyData, pointsSet);
    })
  }
}
async function imageLoading(dcmFiles) {

}
//   .then(function (seriesSets) {
//     SeriesSets = seriesSets;
//     console.log(SeriesSets)
//   }).then(function (res) {
//     var domCanvas = document.getElementById("dicomImage");
//     // uploaderprogress.innerHTML = '100%';
//     // console.log(SeriesSets)
//     var dicomViewer = new DICOMViewer(domCanvas);
//     var seriesID = Object.keys(SeriesSets)[0];
//     // console.log(SeriesSets[seriesID][0].dataSet)
//     const dcmData = dataDicom(SeriesSets[seriesID][0].dataSet);
//     dataDicomShow(dcmData);
//     console.log(SeriesSets[seriesID]);
//     // 查看器点击事件 
//     bindEvent(dicomViewer, SeriesSets[seriesID].length);

//     //var pointsSet = [];
//     dicomViewer.setDcmSeriesInfo(SeriesSets[seriesID], pointsSet);
//     filesDicom(SeriesSets, pointsSet, dicomViewer);
//   })
// }

// function test(e) {
//   console.log();
//   const relativePath = e.innerText;
//   const selectFileList = fileList.filter( val => {
//     return val.webkitRelativePath.match(relativePath);
//   });
//   console.log(selectFileList);
//   uploadFile(selectFileList)
// }
