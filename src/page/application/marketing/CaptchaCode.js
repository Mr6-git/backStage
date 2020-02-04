import React, { Component, Fragment } from 'react';
import {
	Card,
	Input,
	message,
	Breadcrumb,
} from 'antd';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';

const BreadcrumbItem = Breadcrumb.Item;
const { Search } = Input;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			smsCode: '',
			isLoading: false
		}
	}

	onSearch = (mobile) => {
		const { isLoading } = this.state;

		if (isLoading) return;

		if (!mobile || mobile.toString().length != 11) {
			message.info('手机号码格式有误');
			return;
		}

		this.setState({
			isLoading: true,
		});
		NetMarketing.getSmsCode(mobile).then((res) => {
			this.setState({
				smsCode: res.data.sms_code,
				isLoading: false,
			});
		}).catch((res) => {
			message.error(res.msg);
			this.setState({
				isLoading: false,
			});
		});
	}

	render() {
		const { smsCode, isLoading } = this.state;
		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>营销管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>手机验证码</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<div style={{ margin: '150px 0px 220px 0px', textAlign: 'center' }}>
								<Search type="number" size="large" min={11} maxLength={11} placeholder="请输入手机号码" enterButton="查询" style={{ width: '450px' }} onSearch={this.onSearch} />
								{smsCode ? (<div style={{ marginTop: '20px', fontSize: '18px' }}>短信验证码：{smsCode}</div>) : null}
							</div>
						</Card>
					</div>
				</Fragment>
	}
}
