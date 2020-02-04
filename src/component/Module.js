import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import { Event } from '@/utils';

export default class Module extends PureComponent {
	state = {
		visible: false,
		props: null,
		module: null,
		parent: null
	}
	componentDidMount() {
		Event.on('OpenModule', this.openModule);
		Event.on('ChangeModule', this.changeModule);
		Event.on('CloseModule', this.closeModule);
		Event.on('ValidateCloseModule', this.validateCloseModule);
	}
	openModule = (data) => {
		this.setState({
			visible: true,
			props: data.props,
			module: React.cloneElement(data.module, {onClose: this.closeModule}),
			parent: data.parent
		})
	}
	resetComponentWillUnmount() {
		this.state.props = null;
		this.state.parent = null;
	}
	changeModule = (data) => {
		if (data.module) this.state.module = React.cloneElement(data.module, {onClose: this.closeModule});
		if (data.parent && this.state.parent != data.parent) {
			this.resetComponentWillUnmount();
			this.state.parent = data.parent
		}

		this.setState({
			props: {...this.state.props, ...data.props}
		});
	}
	closeModule = () => {
		this.resetComponentWillUnmount();
		this.setState({
			visible: false
		})
	}
	validateCloseModule = (parent) => {
		if (parent == this.state.parent) {
			this.closeModule();
		}
	}
	async onOk() {
		if (!this.state.props || !this.state.props.onOk) return this.closeModule();
		let result = await this.state.props.onOk();
		if (result !== false) {
			this.closeModule();
		}
	}
	async onCancel() {
		if (!this.state.props || !this.state.props.onCancel) return this.closeModule();
		let result = await this.state.props.onCancel();
		if (result !== false) {
			this.closeModule();
		}	
	}
	componentWillUnmount() {
		Event.off('OpenModule', this.openModule);
		Event.off('ChangeModule', this.changeModule);
		Event.off('CloseModule', this.closeModule);
		Event.off('ValidateCloseModule', this.validateCloseModule);
	}
	render() {
		return <Modal {...this.state.props}
					destroyOnClose={true}
					visible={this.state.visible}
					onOk={() => {
						this.onOk();
					}}
					onCancel={() => { this.onCancel() }} >
					{this.state.module}
				</Modal>
	}
}

