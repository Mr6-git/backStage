import React, { Component, Fragment } from 'react';
import {
	Card,
	Table,
	Avatar,
	message,
} from 'antd';
import utils, { Event } from '@/utils';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';


export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
		};
	}

	componentDidMount() {
		this.getData();
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getData = () => {
		let obj = {
			msg_type: this.props.type
		}
		NetSystem.getDingtalkTemplate(obj).then(res => {
			if (res.code == 200) {
				this.setState({
					data: res.data.rows
				})
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getColumns() {
		return [
			{
				title: '消息名称',
				dataIndex: 'title',
				width: 250
			}, {
				title: '备注',
				dataIndex: 'remark'
			},
		]
	}

	render() {
		const { data } = this.state;
		const columns = this.getColumns();
		return <Fragment>
					<div className={globalStyles.detailContent}>
						<Card bodyStyle={{ padding: '0' }} bordered={false}>
							<Table
								columns={columns}
								rowKey={record => record.order_number}
								dataSource={data}
								onChange={(...args) => { this.handleTableChange(...args) }}
								pagination={false}
							/>
						</Card>
					</div>
				</Fragment>
	}
}