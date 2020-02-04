import React, { Component, Fragment } from 'react';
import {
	Card,
	Input,
	Radio,
	Select,
	message,
	Breadcrumb,
} from 'antd';
import NetMarket from '@/net/market';
import styles from './styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			event_id: '',
			board_tag: '20191207',
			display: 0
		}
	}

	componentWillMount() {
		this.getData();
	}

	getData() {
		const { board_tag } = this.state;
		const json = {
			board_tag: board_tag
		};
		NetMarket.getBillboard(json).then(res => {
			const data = res.data;
			this.setState({
				event_id: data.event_id ? data.event_id.toString() : '',
				display: data.display
			});
		}).catch(err => {
			this.setState({
				display: 0
			});
		});
	}

	onInputChange = (e) => {
		this.setState({
			event_id: e.target.value
		});
	}

	onSelectChange = (value) => {
		this.setState({
			board_tag: value
		}, () => {
			this.getData();
		});
	}

	onSwitchChange = (e) => {
		const { event_id, board_tag } = this.state;
		if (event_id == '') {
			message.warning('请输入赛事ID');
			return;
		}
		if (board_tag == '') {
			message.warning('请选择看盘标签');
			return;
		}
		const display = e.target.value;
		let data = {
			"board_tag": board_tag,
			"event_id": Number(event_id),
			"display": display,
			"timeout": 86400
		}
		NetMarket.setBillboard(data).then(res => {
			message.success('操作成功');
			this.setState({ display: display });
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	render() {
		const { display, event_id, board_tag } = this.state;
		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>赛事中心</BreadcrumbItem>
							<BreadcrumbItem>看板管理</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>室外投屏-微控</h3>
					</div>
					<div className={globalStyles.content}>
						<Card bordered={false}>
							<div style={{ margin: '150px 0px 220px 0px', textAlign: 'center' }}>
								<Select size="large" style={{ width: '200px' }} placeholder="请选择看盘标签" onChange={this.onSelectChange} defaultValue={board_tag}>
									<Option value="20191127">沙排（20191127）</Option>
									<Option value="20191207">拳击（20191207）</Option>
								</Select>
								<div style={{ display: "inline-block", width: '150px', marginLeft: '10px' }}>
									<Input placeholder="请输入赛事ID" size="large" onChange={this.onInputChange} value={event_id} />
								</div>
								<Radio.Group value={display} buttonStyle="solid" size="large" style={{ marginLeft: '10px' }} onChange={this.onSwitchChange}>
									<Radio.Button value={1}>盘口</Radio.Button>
									<Radio.Button value={0}>画面A</Radio.Button>
									<Radio.Button value={2}>画面B</Radio.Button>
								</Radio.Group>
							</div>
						</Card>
					</div>
				</Fragment>
	}
}
