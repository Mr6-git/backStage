import React, { Component } from 'react';
import {
	Row,
	Col,
	Card,
	message,
	Divider,
	Progress
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import MapChart from '@/component/echarts/MapChart';
import BarChart from '@/component/echarts/BarChart';
import PieChart from '@/component/echarts/PieChart';
import NoChartData from '@/component/NoChartData';
import NetReport from '@/net/report';
import GDPList from '@/component/GDPList';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import geoJson from 'echarts/map/json/china.json';
import manIcon from '@/resource/images/man_icon.png';
import womanIcon from '@/resource/images/woman_icon.png';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ageData: [],
			areaData: [],
			levelData: [],
			identityData: {},
			sexData: {},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 40,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true
		}
	}

	async componentWillMount() {
		await this.getCustomerIdentityRatio();
		await this.getCustomerSexRatio();
		await this.getCustomerAgeDistribution();
		await this.getCustomerLevelRatio();
		await this.getCustomerRegionDistribution();
	}

	getCustomerAgeDistribution = () => {
		NetReport.getCustomerAgeDistribution().then(res => {
			const ageData = [];
			res.data.map(item => {
				ageData.push(item.total);
			});
			this.setState({
				loading: false,
				ageData,
			});
			ageData = null;

		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	getCustomerLevelRatio = () => {
		NetReport.getCustomerLevelRatio().then(res => {
			const levelData = [];
			res.data.map(item => {
				levelData.push({ name: item.name, value: item.amount, icon: 'circle', ratio: (item.ratio / 100) + '%' });
			});
			this.setState({
				loading: false,
				levelData,
			});
			levelData = null;

		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	getCustomerRegionDistribution = () => {
		NetReport.getCustomerRegionDistribution().then(res => {
			const areaData = [];
			res.data.map((item, index) => {
				areaData.push({ name: item.name || '其他', value: item.amount, icon: 'circle', ratio: (item.ratio / 100) + '%' });
			});
			this.setState({
				loading: false,
				areaData
			});
			areaData = null;

		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false
			});
		});
	}

	getCustomerIdentityRatio = () => {
		NetReport.getCustomerIdentityRatio().then(res => {
			this.setState({
				loading: false,
				identityData: res.data
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false
			});
		});
	}

	getCustomerSexRatio = () => {
		NetReport.getCustomerSexRatio().then(res => {
			this.setState({
				loading: false,
				sexData: res.data
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false
			});
		});
	}

	randerProgress = (type) => {
		let data,
			name,
			state = this.state;
		switch (type) {
			case 'institution':
				data = state.identityData.institution;
				name = '机构客户';
				break;
			case 'nature':
				data = state.identityData.nature;
				name = '自然人';
				break;
			case 'internal':
				data = state.identityData.internal;
				name = '内部员工';
				break;
			case 'unowned':
				data = state.identityData.unowned;
				name = '无归属客户';
				break;
		}
		return <div>
			<Progress
				strokeWidth={12}
				width={100}
				strokeColor="#FF6600"
				type="circle"
				percent={Object.keys(identityData).length > 0 ? identityData.institution.ratio : 0}
				format={() => (
					<div>
						<p style={{ marginTop: '20px', fontSize: '15px' }}>{data.total}人</p>
						<p style={{ fontSize: '15px', color: '#000' }}>{name}</p>
					</div>
				)}
			/>
			<p className={styles.p_two}>占总客户比率<span style={{ color: '#3AA0FF', marginLeft: '5px' }}>{data.ratio}%</span></p>
		</div>
	}

	render() {
		const state = this.state;
		const { ageData, areaData, levelData, identityData, sexData } = state;
		const ageOption = {
			xAxis: {
				data: ['<18', '18~22', '23~30', '31~40', '41~50', '51~60', '>60'],
				axisLabel: {
					interval: 0,
					rotate: 45
				}
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				formatter: function (params) {
					return params[0].name + '岁：' + utils.formatMoney(params[0].value, 0) + '人';
				}
			},
			grid: {
				bottom: 0
			},
			data: [
				{
					name: '',
					type: 'bar',
					barWidth: 20,
					color: '#1890FF',
					data: ageData
				}
			]
		}

		const levelHeader = [
			{ title: '等级', width: 5 },
			{ title: '客户数', width: 10 },
			{ title: '占比', width: 9 }
		];

		const areaHeader = [
			{ title: '地域', width: 5 },
			{ title: '客户数', width: 10 },
			{ title: '占比', width: 9 }
		];

		const levelSeries = {
			label: {
				normal: {
					show: false,
					position: 'center'
				},
				emphasis: {
					show: true,
					textStyle: {
						fontSize: '25',
						fontWeight: 'bold'
					}
				}
			}
		};

		let mapMinValue = 0;
		let mapMaxValue = 10000;

		if (areaData.length > 0) {
			mapMaxValue = areaData[0].value;
			mapMinValue = areaData[areaData.length - 1].value;
		}

		return <div className={globalStyles.content}>
			<div className={globalStyles.mBottom16}>更新日期：{moment().startOf('day').add(-1, 'day').format('YYYY-MM-DD')}</div>
			<Row gutter={16} className={globalStyles.mBottom16}>
				<Col span={16}>
					<Card bordered={false} className={styles.spread}>
						<h3>客户身份</h3>
						<Row>
							<Col span={6} className={styles.progress}>
								<div style={{ textAlign: 'center' }}>
									<Progress
										strokeWidth={10}
										width={120}
										strokeColor="#FF6600"
										type="circle"
										percent={Object.keys(identityData).length > 0 ? identityData.institution.ratio / 100 : 0}
										format={percent => (
											<div>
												<p style={{ marginTop: '20px', fontSize: '15px' }}>{Object.keys(identityData).length > 0 ? identityData.institution.total : 0}人</p>
												<p style={{ fontSize: '15px', color: '#000' }}>机构客户</p>
											</div>
										)}
									/>
									<p className={styles.p_two}>占总客户比率<span style={{ color: '#3AA0FF', marginLeft: '5px' }}>{Object.keys(identityData).length > 0 ? identityData.institution.ratio / 100 : 0}%</span></p>
								</div>
							</Col>
							<Col span={6} className={styles.progress}>
								<div style={{ textAlign: 'center' }}>
									<Progress
										strokeWidth={10}
										width={120}
										strokeColor="#339966"
										type="circle"
										percent={Object.keys(identityData).length > 0 ? identityData.nature.ratio / 100 : 0}
										format={percent => (
											<div>
												<p style={{ marginTop: '20px', fontSize: '15px' }}>{Object.keys(identityData).length > 0 ? identityData.nature.total : 0}人</p>
												<p style={{ fontSize: '15px', color: '#000' }}>自然客户</p>
											</div>
										)}
									/>
									<p className={styles.p_two}>占总客户比率<span style={{ color: '#3AA0FF', marginLeft: '5px' }}>{Object.keys(identityData).length > 0 ? identityData.nature.ratio / 100 : 0}%</span></p>
								</div>
							</Col>
							<Col span={1}>
								<Divider type="vertical" style={{ height: '180px' }} />
							</Col>
							<Col span={5} className={styles.progress}>
								<div style={{ textAlign: 'center' }}>
									<Progress
										strokeWidth={10}
										width={120}
										type="circle"
										percent={Object.keys(identityData).length > 0 ? identityData.internal.ratio / 100 : 0}
										format={percent => (
											<div>
												<p style={{ marginTop: '20px', fontSize: '15px' }}>{Object.keys(identityData).length > 0 ? identityData.internal.total : 0}人</p>
												<p style={{ fontSize: '15px', color: '#000' }}>内部员工</p>
											</div>
										)}
									/>
									<p className={styles.p_two}>占总客户比率<span style={{ color: '#3AA0FF', marginLeft: '5px' }}>{Object.keys(identityData).length > 0 ? identityData.internal.ratio / 100 : 0}%</span></p>
								</div>
							</Col>
							<Col span={6} className={styles.progress}>
								<div style={{ textAlign: 'center' }}>
									<Progress
										strokeWidth={10}
										width={120}
										strokeColor="#666666"
										type="circle"
										percent={Object.keys(identityData).length > 0 ? identityData.unowned.ratio / 100 : 0}
										format={percent => (
											<div>
												<p style={{ marginTop: '20px', fontSize: '15px' }}>{Object.keys(identityData).length > 0 ? identityData.unowned.total : 0}人</p>
												<p style={{ fontSize: '15px', color: '#000' }}>无归属客户</p>
											</div>
										)}
									/>
									<p className={styles.p_two}>占总客户比率<span style={{ color: '#3AA0FF', marginLeft: '5px' }}>{Object.keys(identityData).length > 0 ? identityData.unowned.ratio / 100 : 0}%</span></p>
								</div>
							</Col>
						</Row>
					</Card>
				</Col>
				<Col span={8}>
					<Card bordered={false} className={styles.spread}>
						<h3>性别</h3>
						<Row>
							<Col span={12} className={styles.progress}>
								<div>
									<img src={manIcon} style={{ marginBottom: '12px', width: '85px' }} alt="" title="" />
									<p className={styles.p_one}>{Object.keys(sexData).length > 0 ? sexData.boy.total : 0}人</p>
									<p className={styles.p_two}>占总客户比率<span style={{ color: '#3AA0FF', marginLeft: '5px' }}>{Object.keys(sexData).length > 0 ? sexData.boy.ratio / 100 : 0}%</span></p>
								</div>
							</Col>
							<Col span={1} style={{ width: '0' }}><Divider type="vertical" style={{ height: '180px' }} /></Col>
							<Col span={12} className={styles.progress}>
								<div>
									<img src={womanIcon} style={{ marginBottom: '12px', width: '85px' }} alt="" title="" />
									<p className={styles.p_one}>{Object.keys(sexData).length > 0 ? sexData.girl.total : 0}人</p>
									<p className={styles.p_two}>占总客户比率<span style={{ color: '#3AA0FF', marginLeft: '5px' }}>{Object.keys(sexData).length > 0 ? sexData.girl.ratio / 100 : 0}%</span></p>
								</div>
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>
			<Row gutter={16} className={globalStyles.mBottom16}>
				<Col span={12}>
					<Card bordered={false} className={styles.spread}>
						<h3>年龄分布</h3>
						<BarChart {...ageOption} style={{ height: '198px', marginTop: '20px' }} />
					</Card>
				</Col>
				<Col span={12}>
					<Card bordered={false} className={styles.spread}>
						<h3>等级</h3>
						<Row>
							<Col span={10}><PieChart title="等级" data={levelData} style={{ height: '210px' }} series={levelSeries} legend={{ show: false }} /></Col>
							<Col span={2}><Divider type="vertical" style={{ height: '210px' }} /></Col>
							<Col span={12}><GDPList data={levelData} header={levelHeader} /></Col>
						</Row>
					</Card>
				</Col>
			</Row>
			<Card bordered={false} className={classnames(globalStyles.mBottom16, styles.spread)}>
				<h3>地域分布</h3>
				<Row className={globalStyles.mBottom8}>
					<Col span={17}><MapChart data={areaData} minValue={mapMinValue} maxValue={mapMaxValue} geoJson={geoJson} style={{ height: '480px' }} /></Col>
					<Col span={1}><Divider type="vertical" style={{ height: '480px' }} /></Col>
					<Col span={6}><GDPList data={areaData.slice(0, 15)} header={areaHeader} /></Col>
				</Row>
			</Card>
		</div>
	}
}
