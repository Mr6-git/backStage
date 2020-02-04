import React, { Component } from 'react';
import {
	Icon,
} from 'antd';
import RiseFallIcon from './RiseFallIcon';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	render() {
		const { data, ratio } = this.props;
		
		return <ul>
					<li><label>日</label><RiseFallIcon value={data.ratio_day} /> {Math.abs(data.ratio_day) / ratio}%</li>
					<li><label>周</label><RiseFallIcon value={data.ratio_week} /> {Math.abs(data.ratio_week) / ratio}%</li>
					<li><label>月</label><RiseFallIcon value={data.ratio_month} /> {Math.abs(data.ratio_month) / ratio}%</li>
				</ul>
	}
}