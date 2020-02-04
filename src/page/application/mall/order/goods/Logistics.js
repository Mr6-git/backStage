import React, { Component } from 'react';
import {
	Card,
	Table,
	message
} from 'antd';
import NetMall from '@/net/mall';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			info: []
		}
		this.columns = [
			{
				title: '描述',
				dataIndex: 'content',
				key: 'content'
			}
		];
	}

	componentWillMount() {
		setTimeout(() => {
			if (this.props.statusType == 0 || this.props.statusType == 1 || this.props.statusType == 9) {
				this.setState({
					loading: false,
				});
				return;
			}else {
				this.getData();
			}
		}, 1000)
	}

	getData = () => {
		NetMall.getOrderTrack(this.props.id).then(res => {
			if (res.code == 200) {
				this.setState({
					loading: false,
					info: res.data,
				});
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	render() {
		const { info, loading } = this.state;
		return <div className={globalStyles.detailContent}>
					<Card
						bodyStyle={{ padding: '5px 0px 0px 0px' }}
						bordered={false}
					>
						<Table
							dataSource={info}
							bordered
							columns={this.columns}
							rowKey={record => record._id}
							loading={loading}
							animated={false}
							pagination={false}
						/>
					</Card>
				</div>
	}
}
