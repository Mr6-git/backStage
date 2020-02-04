import React, { Component } from 'react';
import { generatePath } from 'react-router';
import {
	Row,
	Col,
	Spin,
	Button,
	message,
} from 'antd';
import moment from 'moment';
import config from '@/config';
import { history } from '@/utils';
import NetSystem from '@/net/system';
import MyIcon from '@/component/MyIcon';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formData: null,
			loading: true,
		};
	}

	componentWillMount() {
		NetSystem.getSingleAgency(this.props.id).then((res) => {
			this.setState({
				formData: res.data,
				loading: false,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleExchange = () => {
		const url = generatePath(config.prev, { id: this.props.id });
		this.props.onClose();
		history.push(url);
	}

	render() {
		const { formData, loading } = this.state;

		if (loading) return <div className={globalStyles.flexCenter}><Spin /></div>;

		let signTime = '-', expireTime = '-';

		if (formData.expire_time) {
			expireTime = moment.unix(formData.expire_time).format('YYYY-MM-DD');
		}
		if (formData.contract_time) {
			signTime = moment.unix(formData.contract_time).format('YYYY-MM-DD');
		}

		return <div className={styles.detailWrap}>
					<div className={styles.title}>
						<MyIcon
							type="icon-xinfeng"
							className={globalStyles.detailLogo}
						/>
						<span className={styles.client}>机构：{formData.name}</span>
					</div>
					<div className={styles.mainCont}>
						<Row gutter={24} style={{ width: '100%' }}>
							<Col span={12} style={{ marginBottom: '5px' }}>
								<span style={{ color: '#1a1a1a' }}>简称：</span>
								{formData.alias}
							</Col>
							<Col span={12} style={{ marginBottom: '5px' }}>
								<span style={{ color: '#1a1a1a' }}>分成比例：</span>
								 {formData.split_ratio}%
							</Col>
							{/* <Col span={12} style={{ marginBottom: '5px' }}>
								<span style={{ color: '#1a1a1a' }}>签约时间：</span>
								{signTime}
							</Col>
							<Col span={12} style={{ marginBottom: '5px' }}>
								<span style={{ color: '#1a1a1a' }}>到期时间：</span>
								{expireTime}
							</Col> */}
							<Col span={12} style={{ marginBottom: '5px' }}>
								<span style={{ color: '#1a1a1a' }}>描述：</span>
								{formData.desc}
							</Col>
						</Row>

					</div>
					<div className={globalStyles.drawerBottom}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>
							取消
						</Button>
						{/* <Button onClick={this.handleExchange} type="primary">
							切换
						</Button> */}
					</div>
				</div>
	}
}

