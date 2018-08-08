/**
 * [AjaxPost 表单POST提交]
 * @param {String}   url      [submit地址]
 * @param {String}   frm      [form ID]
 * @param {String}   btn      [按钮选择器]
 * @param {Function} callback [回调]
 */
function AjaxPost(url, frm, btn, callback) {
    var btnText = $(btn).html();
    $(btn).html('请稍候...').attr('disabled', true);
	var data = $('#' + frm).serializeArray();
	data.push({"name":"authtoken","value":mystorage.get('authtoken')});
    $.post(url, data, function (jsonReturn) {
		if(jsonReturn.returnCode == 0){
			if(jsonReturn.returnMsg == 10000){
				alertMsg('请先登录', function(){
					location.href = "/Wap/Login/index";
				});
			}
		}
        //回调函数
        if (callback) {
            callback(jsonReturn);
        }
    }, 'json').always(function () {
        setTimeout(function () { $(btn).html(btnText).removeAttr('disabled'); }, 3000);
    });
}
/**
 * [alertMsg 弹框提示]
 * @param  {String} msg  [提示消息]
 * @param  {[type]} succ [回调]
 * @return {[type]}      [description]
 */
function alertMsg(msg, succ, end){
	layer.open({
		content: msg
		,skin: 'msg'
		,time: 2, //3秒后自动关闭
        success: function(){
            if(typeof(succ) == 'function'){
                succ();
            }
        },
		end: function(){
            if(typeof(end) == 'function'){
                end();
            }
        },
        anim :'scale',
	});
}
/**
 * [PostApi API请求]
 * @param {String}   url      [请求地址]
 * @param {Object}   data     [请求参数]
 * @param {Function} callback [回调]
 */
function PostApi(url, data, callback){
	data.authtoken = mystorage.get('authtoken');
	$.post(url,data,function(jsonReturn){
		if(jsonReturn.returnCode == 0){
			if(jsonReturn.returnMsg == 10000){
				alertMsg('登录失效，请重新登录！', '', function(){
					location.href = "/Wap/Login/index"; 
				});
                return;
			}
		}
		if (callback) {
            callback(jsonReturn);
        }
	},'json');
}
/**
 * [cancel_order 订单撤单]
 * @param  {[type]} order_type [订单类型]
 * @param  {[type]} ordersn    [订单号]
 * @return {[type]}            [description]
 */
function cancel_order(order_type, ordersn){
	var url = order_type == 1 ? "/Api/Orders/calcel_buy" : "/Api/Orders/cancel_sell";
	layer.open({
		content: '你确定要撤销该订单吗？'
		,btn: ['确定', '关闭']
		,yes: function(index){
			PostApi(url,
			{
				ordersn:ordersn
			},function(data){
				if(data.returnCode == 1) {
					alertMsg(data.returnMsg, '', function(){
						location.reload();
					});
				} else {
					alertMsg(data.returnMsg);
				}
			});
		}
	});
}

/**
 * [api API请求]
 * @param {String}   url      [请求地址]
 * @param {Function} callback [回调]
 */
function api(url, data, callback){
    $.post(url,data,function(jsonReturn){
        if (callback) {
            callback(jsonReturn);
        }
    },'json');
}

// 验证手机号
function isPhoneNo(phone) {
	if ($.trim(phone).length == 0) {
		return false;
	}
	var pattern = /^1[34578]\d{9}$/;
	return pattern.test(phone); 
}
//-----------------图片上传------------------
/**
 * 合并对象 把obj2属性并入obj1
 * @date   2016-06-28
 * @param  {object}   obj1 默认参数对象
 * @param  {object}   obj2 新参数对象
 * @return {object}        合并后的参数对象
 */
function obj_merge(o1,o2){
    for(key in o2){
        o1[key] = o2[key];
    }
    return o1;
}
var settings = {}; //多个绑定时使用 总设置文件
function bind_uploadOne(options){
    var _this     = this,
        defaults  = {
            uploadUrl : '/Home/Upload/upload.html', //图片上传地址
            bind : '',
            flag : 'IMG', //一个文件中多个绑定时使用
            before : undefined,
            callback : undefined,
            dataType : 'text',
            filemaxsize : 0, //单位M 0为不限制
        };
    var currset = obj_merge(defaults,options);
    var el = $(currset.bind);
    settings[currset.flag] = currset;
    // console.log(settings);
    //为元素添加一个上传控件 关联点击事件
    $(el).each(function(){
        if($(this).siblings('input[type="file"]').length == 0){
            $(this).after('<input class="JS_FILE_'+currset.flag+'" name="JS_FILE" flag="'+currset.flag+'" type="file" multiple="true" value="" style="display:none;">');
        }
        // $(this).unbind().click(function(){
        //     alert('a');
        //     $(this).siblings('input[type="file"]').click();
        // })
    })
    //添加动态事件
    $(document).off('click',currset.bind);
    $(document).on('click',currset.bind,function(event){
        $(this).siblings('input[type="file"]').click();
    });

    //绑定上传事件
    $(document).on('change','.JS_FILE_'+currset.flag,function(event){
        if($(this).val() == '') return;
        _this.upload(event,$(this));
    });

    //上传方法
    _this.upload = function(ev,thisel){
        var formData = new FormData(),flag = $(thisel).attr('flag'),
            target = ev.target || ev.srcElement;
        if(settings[flag].before != undefined) settings[flag].before(thisel);
        if(target.files.length == 0) return;
        //文件大小
        if(settings[flag].filemaxsize > 0){
            var size = fileSize(target);
            if(size>settings[flag].filemaxsize){   
                msg("文件不能大于"+settings[flag].filemaxsize+"M"); 
                return;
            }
        }

        formData.append('file',target.files[0]);
        // console.log(settings);
        $.ajax({
            url         :  settings[flag].uploadUrl,
            type        :  "POST",
            data        :  formData,
            dataType    :  settings[flag].dataType,
            processData :  false,
            contentType :  false,
            cache       :  false,
            success     :  function(data,status,jXhr){
                if(settings[flag].callback != undefined)
                    settings[flag].callback(data,thisel);
            }
        });
    }

}

//获取文件大小
function fileSize(target) {  
    var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
    var fileSize = 0;          
    if (isIE && !target.files) {      
        var filePath = target.value;      
        var fileSystem = new ActiveXObject("Scripting.FileSystemObject");         
        var file = fileSystem.GetFile (filePath);      
        fileSize = file.Size;     
    } else {     
        fileSize = target.files[0].size;      
    }    
    var size = fileSize / 1024 / 1024;     
    return size;
}
//-----------------图片上传------------------


function goBack(){
    window.history.back();
}

// 是否是有效的手机号
function isMobile(v){
    v = $.trim(v);
    return v.match(/^1\d{10}$/);
}
// 是否是空字符串或者null
function isEmpty(v){
    v = $.trim(v);
    return v== null || v == "" || v.length <= 0 || v == false || v == undefined;
}
// 是否不为空字符串
function isNotEmpty(v){
    v = $.trim(v);
    return v!=null && v!="" && v.length>0;
}
// 是否是有效的数字，包括整数与小数
function isNumber(v){
    v = $.trim(v);
    return !isNaN(v);
}
// 是否是整数
function isInteger(v){
    v = $.trim(v);
    return v.match(/^[0-9]*$/)
}
// 是否是货币数字，小数点后两位
function isBigDecimal(v){
    v = $.trim(v);
    if(isNaN(v)){return false;}

    var index = v.lastIndexOf(".");
    if(index==-1){
        return true;
    }else{
        return index>=v.length-4;
    }
}
// 是否是有效的数字，且在指定的范围内
function isNumberRangeIn(v, min, max){
    v = $.trim(v);
    if(isNaN(v)){return false;}
    var v2 = parseFloat(v);
    if(isNaN(v2)){return false;}
    if(v2 < min || v2> max){
        return false;
    }
    return true;
}
// 是否是货币数字，且在指定的范围内
function isDecimalRangeIn(v, min, max){
    v = $.trim(v);
    if(isBigDecimal(v)){
        var v2 = parseFloat(v);
        return v2>=min && v2<=max;
    }
    return false;
}
// 是否全是字母
function isCharacter(v){
    v = $.trim(v);
    return v.match(/^[A-Za-z]+$/);
}
// 是否全是数字
function isDigital(v){
    v = $.trim(v);
    return v.match(/^[0-9]*$/);
}
// 是否包含非法的字符
function isIllegalCharacter(v){
    v = $.trim(v);
    return v.match(/^((?![！~@#￥%……&*]).)*$/);
}
// 字符串长度是否在有效的范围内
function isLengthBetween(v, min, max){
    v = $.trim(v);
    return v!=null && v.length>=min && v.length<=max;
}

function waitOpen(){
    alertMsg('即将开放');
}