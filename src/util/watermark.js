const watermark = {};
const id = 'ws-watermark-background';

let setWatermark = (str, config) => {

    if (document.getElementById(id) !== null) {
        document.body.removeChild(document.getElementById(id));
    }

    //创建一个画布
    let can = document.createElement('canvas');
    //设置画布的长宽
    can.width = config.width || 300;
    can.height = config.height || 120;

    let cans = can.getContext('2d');
    //旋转角度
    cans.rotate(-15 * Math.PI / (config.rotate || 280));
    cans.font = config.font || '12px Vedana';
    //设置填充绘画的颜色、渐变或者模式
    cans.fillStyle = config.fillStyle || 'rgba(200, 200, 200, 0.30)';
    //设置文本内容的当前对齐方式
    cans.textAlign = 'left';
    //设置在绘制文本时使用的当前文本基线
    cans.textBaseline = 'Middle';
    //在画布上绘制填色的文本（输出的文本，开始绘制文本的X坐标位置，开始绘制文本的Y坐标位置）
    cans.fillText(str, can.width / 8, can.height / 2);
    // cans.fillText('万顺叫车', can.width / 8, can.height / 2 + 22);
    let div = document.createElement('div');
    div.id = id;
    div.style.pointerEvents = 'none';
    div.style.top = '30px';
    div.style.left = '0px';
    div.style.position = 'fixed';
    div.style.zIndex = '10000';
    div.style.width = document.documentElement.clientWidth + 'px';
    div.style.height = document.documentElement.clientHeight + 'px';
    div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat';
    document.body.appendChild(div);
    return id;
};

// 该方法只允许调用一次
watermark.set = (str, config = {}) => {
    let _id = setWatermark(str, config);
    if (document.getElementById(id) === null) {
        _id = setWatermark(str, config);
    }
};
watermark.remove = () => { // 移除DOM
    if (document.getElementById(id) !== null) {
        document.body.removeChild(document.getElementById(id));
    }
};

export default watermark;
