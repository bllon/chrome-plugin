//-------------------- 右键菜单演示 ------------------------//
chrome.contextMenus.create({
	title: "测试右键菜单",
	onclick: function(){
		// chrome.notifications.create(null, {
		// 	type: 'basic',
		// 	iconUrl: 'img/icon.png',
		// 	title: '这是标题',
		// 	message: '您刚才点击了自定义右键菜单！'
		// });

		alert('嗨，你点击了右键菜单');
	}
});
chrome.contextMenus.create({
	title: '搜索论文：%s', // %s表示选中的文字
	contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
	onclick: function(params)
	{
		// 注意不能使用location.href，因为location是属于background的window对象
		chrome.tabs.create({url: 'http://www.papers.com/index/index/index.html?keywords=' + encodeURI(params.selectionText)});
	}
});