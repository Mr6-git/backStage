import React, { Component } from 'react';
import PropTypes from 'prop-types';
import utils from '@/utils';
import ECharts from './ECharts';

export default class MapChart extends Component {
	static propTypes = {
		data: PropTypes.array,
		style: PropTypes.object,
		geoJson: PropTypes.object,
		minValue: PropTypes.number,
		maxValue: PropTypes.number,
	}
	static defaultProps = {
		data: {},
		style: {},
		geoJson: {},
	}

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { data, style, minValue, maxValue, geoJson } = this.props;
		const options = {
			tooltip: {
				trigger: 'item',
				formatter: function (params) {
					if (params.value) {
						return params.name + ': ' + utils.formatMoney(Math.abs(params.value));
					}
				}
			},
			visualMap: {
				min: minValue,
				max: maxValue,
				text: ['High', 'Low'],
				realtime: false,
				calculable: true,
				inRange: {
					color: ['lightskyblue', 'yellow', 'orangered']
				}
			},
			series: [
				{
					type: 'map',
					mapType: 'china',
					itemStyle: {
						normal: {
							label: {
								show: true
							}
						},
						emphasis: {
							label: {
								show: true
							}
						}
					},
					data: data
				}
			]
		};

		return (
			<div>
				<ECharts option={options} style={style} geoJson={geoJson} />
			</div>
		)
	}
}