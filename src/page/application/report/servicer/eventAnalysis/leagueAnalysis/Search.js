import React, { Component } from 'react';
import {
	Spin,
	Form,
	Empty,
	Button,
	Select,
	message,
} from 'antd';
import debounce from 'lodash.debounce';
import NetMarket from '@/net/market';
import DataMarketType from '@/data/MarketType'
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;

class Search extends Component {

	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			limit: 10,
			league: [],
			assort: '',
			activeLeague: '',
			searchLeague: '',
			options: [],
			fetching: false,
		};
		this.isFirst = true;
		this.formWrapperCol = { span: 24 }
		this.fetchLeague = debounce(this.fetchLeague, 800);
	}

	componentWillMount() {
		const options = DataMarketType.source.filter(item => item.status == 1);
		this.state.options = options;
		this.state.assort = options[0]._id;
		this.getLeague(options[0]._id);
	}

	getLeague(id) {
		const { page, limit, assort, activeLeague, searchLeague } = this.state;
		const json = {
			page,
			limit,
			assort: id || assort,
			filter: `name:${searchLeague}`
		}
		NetMarket.getLeagues(json, true).then(res => {
			const data = res.data.rows;
			
			if (this.isFirst) {
				const activeLeague = data && data.length ? data[0]._id : '';
				this.state.activeLeague = activeLeague
				this.props.handleSearch(activeLeague);
				this.isFirst = false;
			}
			this.setState({
				league: data,
				fetching: false,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				fetching: false,
			})
		});
	}

	search = () => {
		this.props.handleSearch(this.state.activeLeague);
	}

	handleAssort = value => {
		if (value == this.state.assort) return;
		this.isFirst = true;
		this.setState({
			assort: value,
		}, () => {
			this.getLeague();
		})
	}

	handleLeague = value => {
		if (value == this.state.activeLeague) return;
		this.setState({
			activeLeague: value,
			searchLeague: '',
		}, () => {
			// this.props.handleSearch(value);
		})
	}

	fetchLeague = value => {
		this.setState({
			league: [],
			searchLeague: value,
			fetching: true,
		}, () => {
			this.getLeague();
		})
	}

	render() {
		const { form } = this.props;
		const { options, league, assort, activeLeague, fetching } = this.state;
		return (
			<Form
				className="ant-advanced-search-form"
				onSubmit={this.handleSearch}
			>
				<div className={globalStyles.flex}>
					<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel}>
						<Select
							value={assort}
							className={styles.leftWrap}
							style={{width: '100px'}}
							onChange={this.handleAssort}
						>
							{options && options.length && options.map(item => (
								<Option value={item._id} key={item._id}>{item.title}</Option>
							))}
						</Select>
						<Select
							value={activeLeague}
							placeholder="请输入联赛名称"
							className={styles.rightWrap}
							style={{ width: '250px' }}
							onSearch={this.fetchLeague}
							onChange={this.handleLeague}
							// notFoundContent={fetching ? <Spin size="small" /> : <Empty />}
							filterOption={false}
							showSearch
						>
							{league && league.length ? league.map(item => (
								<Option value={item._id} key={item._id}>{item.name}</Option>
							)) : null}
						</Select>
					</FormItem>
					<FormItem label="" wrapperCol={this.formWrapperCol} className={globalStyles.formItemLabel} style={{ marginLeft: 10 }}>
						<Button type="primary" onClick={this.search}>查询</Button>
						<Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
					</FormItem>
				</div>
			</Form>
		);
	}
}

export default Form.create()(Search);
 