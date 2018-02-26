var pathList = [];
var fileList = [];
function directorySelect(e) {
  var files = e.files;
  console.log(files);
  pathList = [];
  fileList = [];
  for (const key in files) {
    if (files.hasOwnProperty(key)) {
      var val = files[key];
      if(val.name.match(/\.dcm/)) {
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
  console.log(pathList)
  console.log(fileList)
  showDir(pathList);
}

function showDir(list) {
  var page1 = document.getElementById("page1");
  var page2 = document.getElementById("page2");
  page1.style.display = "none";
  page2.style.display = "block";
  var html = '';
  list.forEach(val => {
    html += `<div class="dir-item" onclick="test(this)">${val}</div>`;
  });
  const dirDom = document.getElementById('jsdir');
  dirDom.innerHTML = html;
}
function test(e) {
  console.log();
  const relativePath = e.innerText;
  const selectFileList = fileList.filter( val => {
    return val.webkitRelativePath.match(relativePath);
  });
  console.log(selectFileList);
  uploadFile(selectFileList)
}
