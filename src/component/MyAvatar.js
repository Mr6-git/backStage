import React, { Component } from 'react';
import {
	Avatar,
} from 'antd';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	render() {
		const { member, style, size } = this.props;
		
		const index = Number(member._id.slice(member._id.length - 1, member._id.length)) + 1;
		const avatar = require(`@/resource/images/avatar/${index}.png`);
		
		style.verticalAlign = 'middle';

		return <Avatar style={style} size={size} src={avatar}></Avatar>
	}
}
