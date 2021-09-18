$(function() {
    // 显示桌面通知
    // chrome.notifications.create(null, {
    //     type: 'image',
    //     iconUrl: 'icon.png',
    //     title: '视频号上传商品审核插件已加载',
    //     message: '选中商品右键菜单即可一键上传',
    //     imageUrl: 'icon.png'
    // });

    // chrome.contextMenus.create({
    //     title: "小鹅通视频号上传商品审核",
    //     onclick: function(){
    //         // chrome.notifications.create(null, {
    //         //     type: 'basic',
    //         //     iconUrl: 'icon.png',
    //         //     title: '这是标题',
    //         //     message: '您刚才点击了自定义右键菜单！'
    //         // });
    //         // var goods = $('.ss-show_link');
    //         // console.log(goods);

    //         console.log(123);
    //         alert(123);
    //     }
    // });

    // 获取当前选项卡ID
    function getCurrentTabId(callback)
    {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
        {
            if(callback) callback(tabs.length ? tabs[0].id: null);
        });
    }

    // 向content-script主动发送消息
    function sendMessageToContentScript(message, callback)
    {
        getCurrentTabId((tabId) =>
        {
            chrome.tabs.sendMessage(tabId, message, function(response)
            {
                if(callback) callback(response);
            });
        });
    }

    $('#upload').click(e => {
        var goods_url = $('#goods_url').val();

        var cate_id = $('#cate_id').val();//类目id

        var qualification_pics = $('#qualification_pics').val();//商品资质

        var request = {"goods_url": goods_url, "cate_id": cate_id, "qualification_pics": qualification_pics};

        request = JSON.stringify(request);
        // popup主动发消息给content-script
        sendMessageToContentScript(request, (response) => {

            if (response.code != undefined && response.code == 0) {
                //添加商品和店铺的映射关系
                $.ajax({
                    url: 'https://admin.inside.xiaoe-tech.com/entity_goods/goods/add_goods_map',
                    type: 'post',
                    dataType: 'json',
                    data: {app_id: response.app_id, goods_id: response.goods_id, goods_link: response.goods_link},
                    async: false,    
                    success: function(res){
                        // alert(res.msg);
                    },
                    error: function(e) {
                        // alert(e);
                    }
                });

                alert('上传成功');
            } else {
                alert(response);
            }
        });
    })
});