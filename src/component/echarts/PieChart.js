import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ECharts from './ECharts';

// const colors = ['#3AA0FF', '#36CBCB', '#4DCB73', '#FAD337', '#F2637B', '#975FE4'];
const colors = ['#649FFB', '#EFD344', '#81CA78', '#7BCFD9', '#D36572', '#895EE4'];

export default class PieChart extends Component {
	static propTypes = {
		data: PropTypes.array,
		legend: PropTypes.object,
		series: PropTypes.object,
		title: PropTypes.string,
		style: PropTypes.object,
	}
	static defaultProps = {
		data: {},
		legend: {},
		series: {},
		title: '',
		style: {}
	}

	constructor(props) {
		super(props);
		this.state = {};
	}

	onHandleEnter = (dataIndex, seriesIndex, seriesName, name) => {
		this.pieChart.echart.dispatchAction({
			type: 'pieSelect',
			dataIndex
		});

		this.pieChart.echart.dispatchAction({
			type: 'dataZoom',
			dataZoomIndex: dataIndex,
			start: 0,
			end: 100,
			startValue: seriesIndex,
			endValue: 0
		})

		this.pieChart.echart.dispatchAction({
			type: 'showTip',
			seriesIndex: 0 ,
			dataIndex
		});
	}

	onHandleLeave = (dataIndex, seriesIndex, seriesName, name) => {
		this.pieChart.echart.dispatchAction({
			type: 'pieUnSelect',
			dataIndex
		});

		this.pieChart.echart.dispatchAction({
			type: 'hideTip',
		});
	}

	render() {
		const { data, title, style, legend, series, opTitle = {} } = this.props;
		const optionss = {
			title: opTitle,
			color: colors,
			tooltip: {
				trigger: 'item',
				formatter: "{a} <br/>{b}: {c} ({d}%)"
			},
			legend: {
				orient: 'vertical',
				x: 'right',
				y: 'center',
				align: 'left',
				formatter: '{name}',
				data: data,
				...legend
			},
			series: [
				{
					name: title,
					type: 'pie',
					radius: ['55%', '70%'],
					data: data,
					...series
				}
			]
		};

		return (
			<ECharts
				option={optionss}
				style={style}
				id="stockfunds"
				ref={pieChart => { this.pieChart = pieChart; }}
			/>
		)
	}
}
