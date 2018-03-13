
function dataDicom(byteArray) {

    const dataSet = byteArray;

    const patientName = dataSet.string('x00100010');
    // 病人姓名

    const patientId = dataSet.string('x00100020');
    // 病人代码

    const patientData = dataSet.string('x00100030');
    // 病人日期

    const patientSex = dataSet.string('x00100040');
    // 病人性别

    const patientAge = dataSet.string('x00101010');
    // 病人年龄

    const modality = dataSet.string('x00080060');
    // 创建这个序列中的图象的设备的类型

    const sliceThickness = dataSet.string('x00180050');
    // 切片厚度

    const bodyPartExamined = dataSet.string('x00180015');
    // 检查部位lung

    const studyDescription = dataSet.string('x0008103E');
    // 检查描述

    const generatorPower = dataSet.string('x00181170');
    // 发电机功率 单位Kv

    const tubeCurrent = dataSet.string('x00181151');
    // 射线管的电流 单位ma

    const ww = dataSet.string('x00281051');
    // 窗宽

    const wc = dataSet.string('x00281050');
    // 窗位

    const seriesNumber = dataSet.string('x00200011');
    // 序列号

    let seriesDate = dataSet.string('x00080021');
    // 检查日期

    seriesDate = seriesDate.replace(/(\d{4})(\d{2})(\d{2})/,
        '$1.$2.$3');

    const seriesTime = dataSet.string('x00080031');
    // 检查时间

    const imageOrientation = dataSet.string('x00200037').split('\\')
    //方向

    return {

        patientName,

        patientId,

        patientData,

        patientSex,

        patientAge,

        patientName,

        modality,

        sliceThickness,

        bodyPartExamined,

        studyDescription,

        generatorPower,

        tubeCurrent,

        ww,

        wc,

        seriesNumber,

        seriesDate,

        seriesTime,

        imageOrientation

    }

}