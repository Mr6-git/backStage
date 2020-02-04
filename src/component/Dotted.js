import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	render() {
		let color;
		const { type, className, children } = this.props;
		switch(type) {
			case 'black':
				color = globalStyles.blackBg;
				break;
			case 'grey':
				color = globalStyles.greyBg;
				break;
			case 'red': 
				color = globalStyles.redBg;
				break;
			case 'green':
				color = globalStyles.greenBg;
				break;
			case 'yellow':
				color = globalStyles.yellowBg;
				break;
			case 'blue':
			default:
				color = globalStyles.blueBg;
				break;
		}
		return <span className={className}>
					<i className={classnames(globalStyles.dotted, color)}></i>
					{children}
				</span>
	}
}
