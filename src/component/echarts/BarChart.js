import React, { Component } from 'react';
import PropTypes from 'prop-types'
import ECharts from './ECharts';

export default class BarChart extends Component {
	static propTypes = {
		data: PropTypes.array,
		tooltip: PropTypes.object,
		legend: PropTypes.object,
		xAxis: PropTypes.object,
		style: PropTypes.object,
		grid: PropTypes.object
	}
	static defaultProps = {
		data: {},
		tooltip: {},
		legend: {},
		xAxis: {},
		style: {},
		grid: {},
	}
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const props = this.props;
		const options = {
			tooltip: props.tooltip,
			legend: {
				y: 'bottom',
				data: props.data,
				...props.legend
			},
			grid: {
				top: '7%',
				left: '3%',
				right: '3%',
				bottom: '13%',
				containLabel: true,
				...props.grid
			},
			xAxis: [
				{
					type: 'category',
					axisLine: {
						show: false,
					},
					axisTick: {
						show: false,
					},
					...props.xAxis
				}
			],
			yAxis: [
				{
					show: true,
					axisLine: {
						show: false,
					},
					type: 'value',
					splitLine: {
						show: true,
						lineStyle: {
							color: ['#E5E5E5'],
						},
					},
				}
			],
			series: props.data
		};

		return (
			<div>
				<ECharts option={options} style={props.style} />
			</div>
		)
	}
}