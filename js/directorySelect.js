var pathList = [];
var fileList = [];
function directorySelect(e) {
  var files = e.files;
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
  var arr = [];
  analyticLazyArr = []
  var dicomImage = new DICOMImage();
  var SeriesSets = {};
  var seriesId = ''

  if (dcmFiles.length > 20) {
    arr = dcmFiles.splice(20)
    dicomImage.loadDicomFiles(dcmFiles).then(function (res) {
      seriesId = Object.keys(res)[0];
      analyticLazyArr = analyticLazyArr.concat(res[seriesId])
      dataDicomShow(dataDicom(res[seriesId][0].dataSet));
      bindEvent(dicomViewer, res[seriesId].length);
      dicomViewer.setDcmSeriesInfo(res[seriesId], pointsSet);
      filesDicom(res, pointsSet, dicomViewer);

      drawDicomData(arr,dicomImage).then(res => {
        analyticLazyArr = analyticLazyArr.concat(res[seriesId])
        console.log(analyticLazyArr)
      })
    })
  }
}
async function drawDicomData(dcmFiles,dicomImage) {
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
