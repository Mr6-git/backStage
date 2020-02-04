import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ECharts from './ECharts';

const colors = ['#108DE9', '#9EDA85', '#FF9966'];

export default class LineChart extends Component {
	static propTypes = {
		data: PropTypes.object,
		title: PropTypes.string,
		onChange: PropTypes.func,
	}
	static defaultProps = {
		data: {},
		title: '',
	}

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { data, title, style, legend, series, opTitle = {}, height } = this.props;
		const yData = data.map(item => item.name);
		const options = {
			title: opTitle,
			color: ['#C1E1FF'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {            // 坐标轴指示器，坐标轴触发有效
					type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'value',
					// show: false,
					splitLine:{ show: false }, // 去除网格线
					axisLine: {
						color: 'tansparent'
					},
				}
			],
			yAxis: [
				{
					type: 'category',
					data: yData,
					splitLine:{ show: false }, // 去除网格线
					axisTick: {
						alignWithLabel: true
					},
					axisLine: {
						color: 'tansparent'
					},
					// show: false,
				}
			],
			series: [
				{
					name: title,
					type: 'bar',
					barWidth: '60%',
					data: data,
					...series
				}
			]
		};

		return (
			<div>
				<ECharts
					option={options}
					style={style || { height: 240}}
				/>
			</div>
		)
	}
}
