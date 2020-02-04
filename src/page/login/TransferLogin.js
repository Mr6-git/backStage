import React, { Component, Fragment } from 'react';


class TransferLogin extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: localStorage.getItem('username') || ''
		};
	}

	componentDidMount() {
		this.hasLogin();
	}

	hasLogin = () => {
		let localHost = process.env.REACT_APP_API;
		let appID = process.env.REACT_APP_DINGTALK_APPID;
		let url = this.GetQueryString("url");
		let redirectURL = encodeURIComponent(`${localHost}/callback/dingtalk/login?type=login&url=` + url);
		let host = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${appID}&response_type=code&scope=snsapi_auth&state=STATE&redirect_uri=`;
		if (dd.env.platform == "notInDingTalk") {
			window.location.href = `http://dev-console.awtio.com/login`;
		} else {
			window.location.href = host + redirectURL;
		}
	}
	GetQueryString = (name) => {
		let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		let r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
		if (r != null) return unescape(r[2]); return null;
	}

	render() {
		return <Fragment></Fragment>
	}
}

export default TransferLogin;
