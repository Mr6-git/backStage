import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ECharts from './ECharts';

export default class LineChart extends Component {
	static propTypes = {
		data: PropTypes.array,
		xAxis: PropTypes.object,
		colors: PropTypes.array,
		style: PropTypes.object,
		legend: PropTypes.object,
		grid: PropTypes.object
	}
	static defaultProps = {
		data: {},
		xAxis: [],
		colors: ['#108DE9', '#9EDA85', '#FF9966', '#9664E1', '#40CACA', '#F9D148'],
		style: {},
		legend: {},
		grid: {}
	}

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { data, xAxis, colors, style, legend, grid } = this.props;
		const options = {
			title: {
				text: '',
				subtext: ''
			},
			color: colors,
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					lineStyle: {
						color: '#E5E5E5'
					}
				}
			},
			grid: {
				top: '7%',
				left: '3%',
				right: '3%',
				bottom: 55,
				containLabel: true,
				type: 'dotted',
				...grid
			},
			legend: {
				y: 'bottom',
				data: data,
				icon: 'circle',
				itemWidth: 5,
				itemHeight: 5,
				itemGap: 13,
				textStyle: {
					fontSize: 14
				},
				...legend
			},
			calculable: true,
			xAxis: [
				{
					axisLine: {
						show: false
					},
					axisTick: {
						show: false
					},
					scale: true,
					minInterval: 1,
					type: 'category',
					splitLine: {
						show: false,
						lineStyle: {
							color: ['#E5E5E5'],
							type: 'dashed',
						},
					},
					...xAxis
				}
			],
			yAxis: [
				{
					show: true,
					axisLine: {
						show: false
					},
					axisTick: {
						show: false
					},
					scale: true,
					type: 'value',
					splitLine: {
						show: true,
						lineStyle: {
							color: ['#E5E5E5']
						}
					}
				}
			],
			series: data
		};

		return (
			<div>
				<ECharts option={options} style={style} />
			</div>
		)
	}
}