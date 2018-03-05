class DICOMViewer {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width, this.height = canvas.height;
        this.ctx = canvas.getContext('2d');
        this.bindEvent();
    }
    setDcmSeriesInfo(dcmSet,pointSet) {
        this.stopRender();
        this.dcmSet = dcmSet;
        this.pointSet = pointSet;
        this.states = {
            current: 0,
            rotate: 0,
            scale: 0.7,
            translate: { x:0, y:0},
            preTranslate: { x:0, y:0},
            num: dcmSet.length,
            pointVisible: true,
            currentPointLocationID: null,
            loopNumber: 0
        };
        this.imgList = this.initImgList();
        this.points = this.getCurrentDcmPoints();
        this.render();
    }
    resetStates() {
        this.states.rotate = 0;
        this.states.scale = 0.7;
        this.states.translate = { x:0, y:0};
        this.states.preTranslate = { x:0, y:0};
    }
    initImgList() {
        const {ctx,dcmSet,width,height} = this;
        return dcmSet.map(({imageData}) => {
            const img = new Image(width,height);
            const imgURL = imageData;
            img.src = imgURL;
            return img;
        });
    }
    getCurrentDcmPoints() {
        const {pointSet,dcmSet,states,width,height} = this;
        const currentDcmInfo = dcmSet[states.current];
        const {rows,columns} = currentDcmInfo;
        this.currentDcmInfo =currentDcmInfo;
        const [DcmWidth,DcmHeight] = rows/columns > width/height ? [width,width * columns/rows] : [height*rows/columns,height];
        this.DcmWidth = DcmWidth,this.DcmHeight = DcmHeight;
        return pointSet.filter(({imageNo}) => parseFloat(imageNo) === currentDcmInfo.imageNo).map((item => {
            const [x,y] = item.location.split(',');
            item.x = +x/currentDcmInfo.rows * DcmWidth;
            item.y = +y/currentDcmInfo.columns * DcmHeight;
            item.l = item.x - item.diameter/2;
            item.r = item.x + item.diameter/2;
            item.u = item.y - item.diameter/2;
            item.d = item.y + item.diameter/2;
            // console.log(item.x,item.y);
            return item;
        }));
    }
    setPointEvent(callback = () => {}) {
        this.pointClickCallback = callback;
    }
    setPointVisibility(visible = true) {
        this.states.pointVisible = visible;
    }
    forward(index) {
        if (index > this.states.num - 1 || index < 0) return false;
        this.states.translate = { x:0, y:0 };
        this.states.preTranslate = { x:0, y:0 };
        this.states.current = index;
        this.points = this.getCurrentDcmPoints();
        // console.log(this.points);
        return true;
    }
    // 上一张图片
    up() {
        this.forward(this.states.current -1);
    }
    // 下一张图片
    down() {
        this.forward(this.states.current + 1);
    }
    // 放大
    zoomIn() {
        this.states.scale *= 1.25;
    }
    // 缩小
    zoomOut() {
        this.states.scale *= 0.8;
    }
    // 重置
    reset() {
        this.resetStates();
    }
    // 拖拽事件
    bindEvent() {
        const {width,height,canvas} = this;
        let d = false,m = false, sx = 0, sy = 0;
        canvas.addEventListener('mousedown',e => {
            e.preventDefault();
            d = true;
            m = false;
            sx = e.clientX;
            sy = e.clientY;
        });
        // this.canvas.addEventListener('mousemove',e => {
        //     if (!this.pointClickCallback) return;
        //     const X = [(e.offsetX - this.states.translate.x*this.states.scale ) - width * (1 - this.states.scale)/2 - (width - this.DcmWidth)*this.states.scale/2]/this.states.scale;
        //     const Y = [(e.offsetY - this.states.translate.y*this.states.scale)  - height * (1 - this.states.scale)/2 - (height - this.DcmHeight)*this.states.scale/2]/this.states.scale;
        //     // console.log('hi',X,Y);
            
        //     const target = this.points.filter(({l,u,r,d}) => X > l && X < r && Y > u && Y < d);
        //     if (!target.length) return;
        //     const point = target[0];
        //     this.pointClickCallback(point);
        //     // console.log('hello',X,Y);
        // });
        canvas.addEventListener('mousemove',e => {
            e.preventDefault();
            if (!d) return;
            m = true;
            this.states.translate = {
                x: (e.clientX - sx)/this.states.scale + this.states.preTranslate.x,
                y: (e.clientY - sy)/this.states.scale + this.states.preTranslate.y
            };
        });
        canvas.addEventListener('mouseup',e => {
            e.preventDefault();
            if (!d) return;
            d = false;
            m = false;
            this.states.preTranslate = {
                x:  this.states.translate.x,
                y:  this.states.translate.y
            };
            if (!m) clickEvent(e);
        });
        let clickEvent = e => {

            if (!this.pointClickCallback) return;
            const X = [(e.offsetX - this.states.translate.x*this.states.scale ) - width * (1 - this.states.scale)/2 - (width - this.DcmWidth)*this.states.scale/2]/this.states.scale;
            const Y = [(e.offsetY - this.states.translate.y*this.states.scale)  - height * (1 - this.states.scale)/2 - (height - this.DcmHeight)*this.states.scale/2]/this.states.scale;
            // console.log('hi',X,Y);
            
            const target = this.points.filter(({l,u,r,d}) => X > l && X < r && Y > u && Y < d);
            if (!target.length) return;
            const point = target[0];
            this.setCurrentPointNo(point.location);
            this.pointClickCallback(point);
            // console.log('hello',X,Y);
        }
        // document.getElementById('rotate').addEventListener('click',e => this.states.rotate = (this.states.rotate + Math.PI/2) % (2*Math.PI));
        // this.canvas.addEventListener("wheel",e => {
            
        // })
    }
    // 设置当前聚焦的点
    setCurrentPointNo(locationID) {
        if (!this.getPoint(locationID)) return;
        this.states.currentPointLocationID = locationID;
    }
    getPoint(_locationID) {
        const target = this.points.filter(({location:locationID}) => locationID === _locationID);
        const point = (target.length)? target[0] : null;
        return point;
    }
    // 画点
    drawPoints() {
        const {points} = this;
        if (!points.length) return;
        points.forEach(point => this.drawPoint(point));
    }
    drawPoint(point) {
        const {ctx,width,height,states,DcmWidth,DcmHeight} = this;
        const {loopNumber,currentPointLocationID} = states;
        const { diameter,x,y,location:locationID } = point;
        const highLight = currentPointLocationID === locationID;
        const radius = diameter/2;
        const a = (x - DcmWidth/2) > 0 ? 1 : -1;
        const b = 2;
        // ,w = 120,h = 40,
        // const px = a*(x + b),py = y - h/2;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x + a * 52,y);
        ctx.strokeStyle = "rgba(235,50,35,1)"
        ctx.stroke();
        ctx.arc(x,y,radius,0,2*Math.PI);
        ctx.fillStyle = "rgba(235,50,35,0.8)"
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x,y,radius + loopNumber%100/10,0,2*Math.PI);
        ctx.strokeStyle = "rgba(235,50,35,0.6)";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(x,y,radius + (loopNumber+50)%100/10,0,2*Math.PI);
        ctx.strokeStyle = "rgba(235,50,35,0.6)";
        ctx.stroke();
        ctx.closePath();
        this.drawLabel(96,32,x + a * 100,y ,diameter + 'mm',highLight);
        ctx.restore();
    }
    drawLabel(width,height,x,y ,content,highLight = false) {
        const {ctx} = this;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - width/2,y - height/2,width,height);
        ctx.fillStyle = ctx.strokeStyle = "rgba(235,50,35,1)";
        highLight ? ctx.fill() : ctx.stroke();
        ctx.closePath();
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 
        ctx.font = `20px Arial`;
        ctx.fillStyle = highLight ? "#fff" : "rgba(235,50,35,1)";
        ctx.fillText(content,x,y);
        ctx.restore();
    }
    // 绘图
    draw(a){
        const {ctx,imgList,width,height,DcmWidth,DcmHeight,states,pointSet} = this;
        const {current,scale,translate,pointVisible} = this.states;
        ctx.save();
        ctx.fillRect(0,0,width,height);
        ctx.fillStyle = "#000";
        
        // save the unrotated context of the canvas so we can restore it later
        // the alternative is to untranslate & unrotate after drawing
    
        // move to the center of the canvas
        ctx.translate(width/2,height/2);
        ctx.scale(scale,scale);
        ctx.translate(-width/2+translate.x + (width - DcmWidth)/2,-height/2+translate.y + (height - DcmHeight)/2);
        ctx.drawImage(imgList[current],0,0,DcmWidth,DcmHeight); // 画dicom图片
        if (pointVisible) this.drawPoints();
        ctx.restore();
    }
    stopRender() {
        if (!this.tid) return;
        window.cancelAnimationFrame(this.tid);
        this.tid = null;
    }
    render() {
        let loop = () => {
            this.draw();
            this.states.loopNumber++;
            this.tid = window.requestAnimationFrame(loop);
        }
        loop();
    }
}
window.DICOMViewer = DICOMViewer;