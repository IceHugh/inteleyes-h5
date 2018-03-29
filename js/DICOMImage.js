class DICOMImage {
    constructor() {
        const canvas = document.createElement('canvas');
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }
    processImage(pixelData, rows, columns, dataSet) {
        // console.log(pixelData)
        const canvas = document.createElement('canvas');
        canvas.width = rows;
        canvas.height = columns;
        const ctx = canvas.getContext('2d');
        // const canvasImageData = ctx.createImageData(rows, columns);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, rows, columns);
        let canvasImageData = ctx.getImageData(0, 0, rows, columns);
        const numPixels = pixelData.length;
        console.log(canvasImageData)
        var parseCanvasimageData = parseCanvas(dataSet,pixelData,canvasImageData)
        
        // console.log(canvasImageData.data.length,numPixels);
        // for (let i = 0; i < numPixels; i++) {
        //     let rgb = pixelData[i]
        //     canvasImageData.data[4 * i] = rgb;
        //     canvasImageData.data[4 * i + 1] = rgb;
        //     canvasImageData.data[4 * i + 2] = rgb;
        //     canvasImageData.data[4 * i + 3] = 255;
        // }
        console.log(parseCanvasimageData)
        // this.lightImage(canvasImageData, 75);
        this.contrastImage(canvasImageData, 180);
        ctx.putImageData(parseCanvasimageData, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        return imageData;
    }
    lightImage(imageData, light) {
        var data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] += light;
            data[i + 1] += light;
            data[i + 2] += light;
        }
        return imageData;
    }
    contrastImage(imageData, contrast) {

        // var data = imageData.data;
        // var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        // for (let i = 0; i < data.length; i += 4) {
        //     data[i] = factor * (data[i] - 128) + 128;
        //     data[i + 1] = factor * (data[i + 1] - 128) + 128;
        //     data[i + 2] = factor * (data[i + 2] - 128) + 128;
        // }
        return imageData;
    }
    getDcmDetail(arrayBuffer) {
        // We need to setup a try/catch block because parseDicom will throw an exception
        // if you attempt to parse a non dicom part 10 file (or one that is corrupted)
        try {
            var byteArray = new Uint8Array(arrayBuffer);
            // parse byteArray into a DataSet object using the parseDicom library
            var dataSet = dicomParser.parseDicom(byteArray);
            // console.log(dataSet)
            // get the pixel data element (contains the offset and length of the data)
            var pixelDataElement = dataSet.elements.x7fe00010;
            var rows = dataSet.uint16('x00280010');
            var columns = dataSet.uint16('x00280011');
            var SeriesInstanceUID = dataSet.string('x0020000e');
            // console.log('SeriesInstanceUID',SeriesInstanceUID);
            var imageNo = parseFloat(dataSet.string('x00201041'));
            var imagePosition = parseFloat(dataSet.string('x00200032').split('\\')[2]);
            const SOPInstanceUID = dataSet.string('x00080018');
            const BodyPartExamined = dataSet.string('x00180015');
            let PatientAge = dataSet.string('x00101010');
            PatientAge = PatientAge ? parseInt(PatientAge.replace('Y', '')) + '岁' : '';
            const PatientSex = (dataSet.string('x00100040') === 'F') ? '女' : '男';
            const PersonName = dataSet.string('x0040a123');
            let SeriesDate = dataSet.string('x00080021');
            // console.log(imagePosition);

            if (!!SeriesDate) {
                SeriesDate = SeriesDate.slice(0, 4) + '-' + SeriesDate.slice(-4, -2) + '-' + SeriesDate.slice(-2);
            }
            // create a typed array on the pixel data (this example assumes 16 bit unsigned data)
            var imageData = new Uint16Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset);
            // console.log(canvasimageData)
            return {
                imageData,
                imagePosition,
                rows,
                columns,
                SOPInstanceUID,
                SeriesInstanceUID,
                imageNo,
                BodyPartExamined,
                PatientAge,
                PatientSex,
                PersonName,
                SeriesDate,
                dataSet
            }
        }
        catch (err) {
            // we catch the error and display it to the user
            console.error(err);
            return null;
        }
    }
    loadDicomFile(DicomFile) {
        return new Promise(resolve => {
            var reader = new FileReader();
            reader.onload = DicomFile => {
                const arrayBuffer = reader.result;
                // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
                // Uint8Array so we create that here
                const dcmDetail = this.getDcmDetail(arrayBuffer);
                const {
                    imageData,
                    rows,
                    columns,
                    dataSet
                } = dcmDetail;
                dcmDetail.imageData = this.processImage(imageData, rows, columns, dataSet);
                dcmDetail.arrayBuffer = arrayBuffer;
                resolve(dcmDetail);
            }
            reader.readAsArrayBuffer(DicomFile);

        })
    }
    async loadDicomFiles(DicomFileList, ctx, width, height) {
        let datasets = {};
        // console.log(DicomFileList)
        for (let file of DicomFileList) {
            if (file.size == 0) {
                continue
            }
            const dcmDetail = await this.loadDicomFile(file);
            dcmDetail.file = file;
            const { SeriesInstanceUID } = dcmDetail;
            if (!(datasets[SeriesInstanceUID] instanceof Array)) datasets[SeriesInstanceUID] = [];
            datasets[SeriesInstanceUID].push(dcmDetail);
        }
        Object.keys(datasets).forEach(seriesID => [seriesID] = datasets[seriesID].sort((a, b) => b.imagePosition - a.imagePosition));
        return datasets;
    }
}
window.DICOMImage = DICOMImage;