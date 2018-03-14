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
  uploadFile(dcmFileList)
  // console.log(pathList)
  // console.log(fileList)
  // console.log(dcmFileList);
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

// async function showImages(dcmFileList) {
//   var page1 = document.getElementById('page1')
//   var page2 = document.getElementById('page2')
//   page1.style.display = 'none';
//   page2.style.display = 'block';
//   var dicomImage = new DICOMImage();
//   var SeriesSets = {};
//   var lazyArr = [];
//   lazyArr = dcmFiles.splice(30)
//   const resData = await dicomImage.loadDicomFiles(dcmFiles).then(function (res) {
//     var seriesId = Object.keys(res)[0];
//     var dcmData = dataDicom(res[seriesId][0].dataSet);
//     dataDicomShow(dcmData);
//   })
// }


function showImages(dcmFiles) {
  var page1 = document.getElementById('page1')
  var page2 = document.getElementById('page2')
  page1.style.display = 'none';
  page2.style.display = 'block';
  var dicomImage = new DICOMImage();
  var SeriesSets = {};
  var lazyArr = [];
  var domCanvas = document.getElementById("dicomImage");
  var dicomViewer = new DICOMViewer(domCanvas);

  lazyArr = dcmFiles.splice(30)
    dicomImage.loadDicomFiles(dcmFiles).then(function (res) {
      var seriesId = Object.keys(res)[0];
      var dcmData = dataDicom(res[seriesId][0].dataSet);
      dataDicomShow(dcmData);
      bindEvent(dicomViewer, res[seriesId].length);
      dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet);
      filesDicom(res, pointsSet, dicomViewer);
    })
      dicomImage.loadDicomFiles(lazyArr).then(function (res) {
        var seriesId = Object.keys(res)[0];
        var dcmData = dataDicom(res[seriesId][0].dataSet);
        bindEvent(dicomViewer, res[seriesId].length);
        dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet);
      //  filesDicom(res, pointsSet, dicomViewer);
      })
    // dicomImage.loadDicomFiles(lazyArr).then(function (res) {
    //   var seriesId = Object.keys(res)[0];
    //   var dcmData = dataDicom(res[seriesId][0].dataSet);
    //   dataDicomShow(dcmData);
    // })
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
