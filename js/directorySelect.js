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

function showImages(dcmFiles) {
  var page1 = document.getElementById('page1')
  var page2 = document.getElementById('page2')
  page1.style.display = 'none';
  page2.style.display = 'block';
  var dicomImage = new DICOMImage();
  var SeriesSets = {};
  dicomImage.loadDicomFiles(dcmFiles).then(function (seriesSets) {
    SeriesSets = seriesSets;
    
  }).then(function (res) {
    var domCanvas = document.getElementById("dicomImage");
    // uploaderprogress.innerHTML = '100%';
    // console.log(SeriesSets)
    var dicomViewer = new DICOMViewer(domCanvas);
    var seriesID = Object.keys(SeriesSets)[0];
    // console.log(SeriesSets[seriesID][0].dataSet)
    const dcmData = dataDicom(SeriesSets[seriesID][0].dataSet);
    dataDicomShow(dcmData);
    console.log(SeriesSets[seriesID]);
    // 查看器点击事件 
    bindEvent(dicomViewer, SeriesSets[seriesID].length);

    var pointsSet = [];
    dicomViewer.setDcmSeriesInfo(SeriesSets[seriesID], pointsSet);
    filesDicom(SeriesSets, pointsSet, dicomViewer);
  })
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
