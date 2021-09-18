console.log('视频号上传商品审核插件已加载。。。');

// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    var href = window.location.href;

    if (href.indexOf("https://admin.xiaoe-tech.com") == -1) {
        sendResponse("此插件仅在小鹅通店铺管理台使用");
        return false;
    }

    if (document.cookie.indexOf("with_app_id") == -1) {
        sendResponse("请登录进到店铺管理台后使用");
        return false;
    }


    request = JSON.parse(request);

	var goods_url = request.goods_url;
    var cate_id = request.cate_id;
    var qualification_pics = request.qualification_pics;

    if (qualification_pics != '') {
        qualification_pics = qualification_pics.split(/[\s\n]/);
    } else {
        qualification_pics = []
    }

    if (goods_url == '') {
        sendResponse("请输入商品链接");
        return false;
    }

    //正则匹配第一种商品链接
    var result = goods_url.match(/entity\/([\S]+)\?/);
    if (result == null || result == undefined) {
        
        //匹配第二种商品链接
        var result = goods_url.match(/SPU_ENT_([\S]+)/);

        if (result == null || result == undefined) {
            sendResponse("无效的商品链接");
            return false;
        }

        var spu_id = result[0];
        var goods_id;
        
        var msg = '';
        $.ajax({
            url: 'https://admin.xiaoe-tech.com/xe.spu.spu_id.detail/1.0.0',
            type: 'post',
            dataType: 'json',
            data: {spu_id : spu_id},
            async: false,  
            success: function(res){
                console.log(res)
                if (res.code == 0) {
                    goods_id = res.data.resource_id
                    console.log(goods_id);
                } else {
                    msg = res.msg;
                }
            },
            error: function(e) {
                console.log(e);
                msg = "上传请求失败";
            }
        });

        if (msg != '') {
            sendResponse(msg);
            return false;
        }
    } else {
        var goods_id = result[1];
    }

    if (goods_id == undefined) {
        sendResponse("找不到对应商品");
        return false;
    }

    var msg;
    var code;
    var requestData;

    if (cate_id != '') {
        cate_id = parseInt(request.cate_id);
        requestData = {resource_id : goods_id, category_id : cate_id, qualification_pics : qualification_pics};
    } else {
        requestData = {resource_id : goods_id, qualification_pics : qualification_pics};
    }

    $.ajax({
        url: 'https://admin.xiaoe-tech.com/entity_goods/goods/add_spu_goods',
        type: 'post',
        dataType: 'json',
        data: requestData,
        async: false,    
        success: function(res){
            msg = res.msg;
            code = res.code;
        },
        error: function(e) {
            msg = "上传请求失败";
        }
    });

    if (code == 0) {
        //提取app_id
        var result = goods_url.match(/https:\/\/([\S]+?)\./);
        if (result != null && result != undefined) {
            var app_id = result[1];

            //通知popup.js添加商品和店铺的映射关系
            var data = {'code': 0, 'app_id':app_id, 'goods_id':goods_id, 'goods_link':goods_url};
            sendResponse(data);
        }
    }

    sendResponse(msg);
});