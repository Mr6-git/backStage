import React, { Component } from 'react';
import {
	Card,
	Table,
	message,
	Tooltip
} from 'antd';
import moment from 'moment';
import utils, { Event } from '@/utils';
import DataMember from '@/data/Member';
import MyPopover from '@/component/MyPopover';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true
		}
		this.columns = [
			{
				title: '操作时间',
				dataIndex: 'create_time',
				key: 'create_time',
				width: 200,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm:ss');
					}
					return '-';
				},
			}, {
				title: '操作人',
				dataIndex: 'operator',
				key: 'operator',
				width: 120,
				render: data => {
					if (data == "0") {
						return '系统';
					}
					return <MyPopover memberId={data}>
								<a href="javacript:;">{DataMember.getField(data, 'nickname', () => { this.setState({}) })}</a>
							</MyPopover>
				}
			}, {
				title: '操作信息',
				dataIndex: 'content',
				key: 'content',
				render: (data) => {
					return <Tooltip title={utils.clearUBB(data)}>
								<span dangerouslySetInnerHTML={{ __html: utils.convertUBB(data) }}></span>
							</Tooltip>
				}
			}
		];
	}

	render() {
		return <div className={globalStyles.detailContent}>
					<Card
						bodyStyle={{ padding: '5px 0px 0px 0px' }}
						bordered={false}
					>
						<Table
							dataSource={this.props.data}
							bordered={true}
							columns={this.columns}
							rowKey={record => record._id}
							animated={false}
							pagination={false}
						/>
					</Card>
				</div>
	}
}
