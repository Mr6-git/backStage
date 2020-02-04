import React, { Component } from 'react';
import {
	Icon,
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	render() {
		const { value } = this.props;
		
		if (value > 0) {
			return <Icon type="arrow-up" style={{ color: 'green' }} />;
		} else if (value < 0) {
			return <Icon type="arrow-down" style={{ color: 'red' }} />;
		} else {
			return <Icon type="minus" style={{ color: '#CCC' }} />;
		}
	}
}