import React, { Component } from 'react';
import NetAccount from '@/net/account';
import styles from '../../style.module.less';

export default class extends Component {
	componentDidMount() {
		this.inItDing();
		// 监听消息处理方法
	}

	inItDing = () => {
		let _this = this;
		var callbackUrl = `${process.env.REACT_APP_API}/callback/dingtalk/login`;
		var redirectUri = encodeURIComponent(`${callbackUrl}?type=bind`);
		var goto = encodeURIComponent(`https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${process.env.REACT_APP_DINGTALK_APPID}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=` + redirectUri)

		var obj = DDLogin({
			id: "login_container",//这里需要你在自己的页面定义一个HTML标签并设置id，例如<div id="login_container"></div>或<span id="login_container"></span>
			goto: goto, //请参考注释里的方式
			style: "border:none;background-color:#FFFFFF;",
			width: "365",
			height: "400"
		});

		var handleMessage = function (event) {
			var origin = event.origin;
			if (origin == "https://login.dingtalk.com") { //判断是否来自ddLogin扫码事件。
				var loginTmpCode = event.data; //拿到loginTmpCode后就可以在这里构造跳转链接进行跳转了
				window.location.href = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${process.env.REACT_APP_DINGTALK_APPID}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${callbackUrl}?type=bind&loginTmpCode=`+ loginTmpCode
			}
		};
		if (typeof window.addEventListener != 'undefined') {
			window.addEventListener('message', handleMessage, false);
		} else if (typeof window.attachEvent != 'undefined') {
			window.attachEvent('onmessage', handleMessage);
		}
	}

	render() {
		return <div style={{ textAlign: 'center' }}>
			<div id="login_container"></div>
		</div>;
	}
}