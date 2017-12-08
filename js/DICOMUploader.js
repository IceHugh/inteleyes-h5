class DICOMUploader {
    constructor(datasets,{url,progress = () => {}}) {
        this.datasets = datasets;
        this.uploadRecord = this.getUploadRecord();
        this.url = url;
        this.progressCallback = progress;
        this.totalSendNum = 0,this.hasSentNum = 0,this.sendingNum = 0;
    }
    processFile(fileBuffer) {
        const crcCode = this.crc32(new Uint8Array(fileBuffer));
        let fileData = this.getBinary(fileBuffer);
        fileData = this.Base64(fileData);
        return {crcCode,fileData};

    }
    async send() {
        const {datasets,uploadRecord} = this;
        const groups = [];
        const seriesIDList = Object.keys(datasets);
        for(let seriesID of seriesIDList) {
            const fileSeries = datasets[seriesID].filter(({SOPInstanceUID}) => {
                return !~uploadRecord.indexOf(SOPInstanceUID);
            }).map(dicomDetail => {
                const res =  this.processFile(dicomDetail.arrayBuffer);
                // res.seriesID = seriesID;
                res.SOPInstanceUID = dicomDetail.SOPInstanceUID
                res.imageNo = dicomDetail.imageNo;
                res.SeriesInstanceUID = dicomDetail.SeriesInstanceUID;
                return res;
            });
            this.totalSendNum += fileSeries.length;
            for (let i = 0; i < fileSeries.length; i+=4) {
                groups.push(fileSeries.slice(i,Math.min(i + 4)));
            }
        }
        debugger;
        for (let i = 0; i < groups.length; i++) {
            try {
                this.sendingNum = groups[i].length;
                const res = await this.sendGroup(groups[i][0].SeriesInstanceUID,groups[i]);
                this.addUploadRecord(groups[i].map(item => item.SOPInstanceUID)); // 该组发送成功，将该组的文件id添加至本地缓存
                this.hasSentNum += this.sendingNum;
                this.sendingNum = 0;
                debugger
                this.progressCallback(this.hasSentNum/this.totalSendNum,res);
            } catch(err) {
                throw err;
            }

        }
        return 1;
    }
    sendGroup(serialUID,group) {

        //新建一个FormData对象    
        let formData = new FormData();
        const fileinfo = {
          institutionId: "00001",
          channelId: "00002",
          serialUID
        }
        let fileSign = {};
        group.forEach(({crcCode,fileData,imageNo,SOPInstanceUID}) => {
            formData.append("data", new Blob([fileData], { type: 'application/octet-stream' }), imageNo);
            fileSign[imageNo] = crcCode;
        });
        fileinfo.fileSign = fileSign;
        formData.append('fileinfo', new Blob([JSON.stringify(fileinfo)], { type: 'application/json' }, 'fileinfo'));
        return this.sendData(formData);
    }
    getUploadRecord() {
        try {
            let record = JSON.parse(localStorage.getItem('uploadRecord'));
            if (record instanceof Array && record.length) return record;
            else return [];
        } catch(err) {
            return [];
        }
    }
    addUploadRecord(groupRecord) {
        this.uploadRecord = [...new Set(this.uploadRecord.concat(groupRecord))];
        localStorage.setItem('uploadRecord',JSON.stringify(this.uploadRecord));
        
    }
    sendData(formData) {
        const {hasSentNum,sendingNum,totalSendNum} = this;
        return new Promise((resolve,reject) => {
            const xhr = new XMLHttpRequest();
            // xhr.addEventListener('readystatechange', function handleResponse(e) {
            //     if (xhr.readyState == 4 && xhr.status == 200) {
            //         document.getElementById("results").innerHTML = xhr.responseText;
            //     }
            // });
            xhr.upload.addEventListener('progress', e => {
                // progress.max = e.total;
                // progress.value=e.loaded;
                if (e.lengthComputable) this.progressCallback((hasSentNum + sendingNum*e.loaded / e.total)/totalSendNum);
            });
            xhr.addEventListener('load', e => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    const res = JSON.parse(xhr.responseText);
                    if (res.code === 0) {
                        resolve(res);
                    } else reject(res.message);
                } else reject();
            });
            xhr.addEventListener('error', e => {
                reject();
            });
            xhr.open("POST", this.url);
            xhr.send(formData);
            // xhr.send(JSON.stringify(formData));
        });
    }
    getBinary(res) {
        var binary = "";
        var bytes = new Uint8Array(res);

        var length = bytes.byteLength;

        for (var i = 0; i < length; i++) {

            binary += String.fromCharCode(bytes[i]);

        }
        return binary;
    }
    Base64(input) {

        // private property
        const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for encoding
        
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;

    }
    crc32(str) {
        //str = Utf8Encode(str);  
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
        var crc = 0;
        var x = 0;
        var y = 0;

        crc = crc ^ (-1);
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            y = (crc ^ str[i]) & 0xFF;
            x = "0x" + table.substr(y * 9, 8);
            crc = (crc >>> 8) ^ x;
        }

        return (crc ^ (-1)) >>> 0;
    }
}