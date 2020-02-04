import React, { Component } from 'react';
import { Spin } from 'antd';

export default (loader) => {
	return class extends Component {
		state = {
			component: null,
			error: false
		}
		reload = () => {
			this.setState({error: false});
			loader()
			.then(cmp => {
				this.setState({component: cmp.default});
			}).catch((...args) => {
				this.setState({error: true});
			});
		}
		reloadPage = () => {
			window.location.href = window.location.hre;
		}
		componentDidMount() {
			this.reload();
		}
		render() {
			if (this.state.error) {
				return <div style={{padding: 36, textAlign: 'center'}}>模块加载失败，<a href="javascript:;" onClick={this.reloadPage}>请刷新页面</a></div>
			}
			const Com = this.state.component;
			if (!Com) return <div style={{position: 'absolute', top: '50%', margin: '-29px 0 0 -29px', left: '50%'}}>
									<Spin size="large" tip="loading…" />
								</div>
			return <Com {...this.props} />;
		}
	}
};
