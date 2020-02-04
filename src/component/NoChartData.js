import React, { Component } from 'react';
import {
	Icon,
} from 'antd';
import PropTypes from 'prop-types';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	static propTypes = {
		style: PropTypes.object
	}
	static defaultProps = {
		style: {}
	}
	render() {
		const { style } = this.props;
		return <div className={globalStyles.noData} style={style}>
					<div></div>
					<label><Icon type="warning" theme="filled" />暂无数据</label>
				</div>
	}
}