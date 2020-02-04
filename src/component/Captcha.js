import React, { Component } from 'react';
import NetCommon from '@/net/common';

export default class extends Component {
	state = {
		captcha: '',
		loading: false
	}
	getSrc = () => {
		if (this.state.loading) return;
		this.state.loading = true;	
		NetCommon.getCaptcha().then((res) => {
			this.state.loading = false;
			this.setState({captcha: res.data.captcha})
		}).catch(() => {
			this.state.loading = false;
		});
	}
	componentDidMount() {
		this.getSrc();
	}
	render() {
		const { captcha } = this.state;
		return captcha ? <img title="点击刷新验证码"  {...this.props} src={captcha} onClick={this.getSrc} /> : null
	}
}
