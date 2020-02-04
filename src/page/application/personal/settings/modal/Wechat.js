import React, { Component } from 'react';
import NetAccount from '@/net/account';
import styles from '../../style.module.less';

export default class extends Component {

	handleEmail = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				
			}
		});
	}

	render() {
		return <div style={{ textAlign: 'center' }}>
					<img
						className={styles.qrCode}
						src="http://rp.awt.im/console/images/%E8%B4%A6%E6%88%B7%E6%A6%82%E5%86%B5/u155.jpg"
						alt=""
					/>
					<div className={styles.qrTitle}>微信扫码，完成账户绑定</div>
				</div>;
	}
}