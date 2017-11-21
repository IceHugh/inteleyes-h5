
//提示
var Tips = {
    //显示错误提示
    ShowError: function (id, info) {
        $('#' + id).show().removeClass('success').addClass('error').html(info);
    },
    //显示正确提示
    ShowRight: function (id, info) {
        $('#' + id).show().removeClass('error').addClass('success').html(info || '&nbsp;');
    },
    //清除错误提示
    ClearError: function (id) {
        $('#' + id).removeClass('error').html('');
    }
}


//登录
var Login = {
    //用户名验证
    NameValidate: function () {
        //邮箱验证
        var regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        //手机号码验证
        // var phone = /(\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{3,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/;
        var txtName = $.trim($('#txtName').val());

        if (txtName=="") {
            Tips.ShowError('TName', '请输入用户名');
            return false;
        }
        if (!regEmail.test(txtName)) {
            Tips.ShowError('TName', '邮箱格式不对');
            $('#txtName').attr('right', 0);
            return false;
        }
        // if (!phone.test(txtName)) {
        //     Tips.ShowError('TName', '手机格式不对');
        //     $('#txtName').attr('right', 0);
        //     return false;
        // }
        Tips.ClearError('TName');
        return true;
    },


    //密码验证
    PwdValidate: function () {
        $("#TPwd").html("");
        var passWord = $.trim($('#txtPwd').val());
        var regPwd = /^[\W\w]{6,20}$/; //---/^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,22}$/;//数字、字母以及特殊字符
        var pLength = passWord.length;
        if (pLength == 0) {
            Tips.ShowError('TPwd', '请输入登录密码');
            return false;
        }
        else if (pLength > 20 || pLength < 6) {
            Tips.ShowError('TPwd', '长度不对');
            return false;
        }
        else {
            if (!regPwd.test(passWord)) {
                Tips.ShowError('TPwd', '格式不对');
                return false;
            }
            else {
                Tips.ClearError('TPwd');
                return true;
            }
        }
    },
    //表单验证
    CheckSave: function () {
        var flag = true;
        if (!Login.NameValidate())
            flag = false;
        if (!Login.PwdValidate())
            flag = false;
        return CheckSubmit.Submit(flag);
    }
}





//防止重复提交表单,注意此方法只对重复提交验证,不对表单验证(请独立验证)
//使用示例：return CheckSubmit.Submit(true);
var CheckSubmit = {
    //提交次数统计
    SubmitCount: 0,
    //初始化统计量避免操作成功后无法继续操作
    InitCount: function () {
        SubmitCount = 0;
    },
    //验证
    Check: function () {
        if (CheckSubmit.SubmitCount > 0) {//已提交
            return false;
        }
        else {
            CheckSubmit.SubmitCount += 1;
            return true;
        }
    },
    //确认提交,表单验证在外部,此处只做重复验证
    Submit: function (isSubmit) {//isSubmit为bool参数,表示表单是否已通过验证
        if (isSubmit) {//信息验证通过再验证是否重复提交
            if (!CheckSubmit.Check())//防止重复提交表单
                return false;
            else
                return true;
        }
        else {
            CheckSubmit.SubmitCount = 0; //没通过必须将提交次数初始化，避免通过后无法提交
            return false;
        }
    }
}
