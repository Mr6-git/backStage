import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import echarts from 'echarts';
import elementResizeEvent from 'element-resize-event';

/**
 *
 * option: 图表的配置项和数据
 * notMerge: 可选，是否不跟之前设置的option进行合并，默认为false，即合并
 * lazyUpdate: 可选，在设置完option后是否不立即刷新画布，默认为false，即立即刷新
 * style: 图表容器的样式,默认高宽100%
 * config: 设置
 *    theme: 主题
 *    event: 事件
 *    showLoading: 是否呈现加载效果
 *    loadingOption: 加载效果设置
 * id: 图表id,可选
 */
class ECharts extends PureComponent {
	static propTypes = {
		option: PropTypes.object.isRequired,
		notMerge: PropTypes.bool,
		lazyUpdate: PropTypes.bool,
		style: PropTypes.object,
		className: PropTypes.string,
		config: PropTypes.object,
		geoJson: PropTypes.object,
		id: PropTypes.string,
	}

	static defaultProps = {
		geoJson: {},
		config: {},
		notMerge: false,
		lazyUpdate: false,
		style: {
			width: '100%',
			height: '100%',
		},
		id: 'chart',
	}

	constructor(props) {
		super(props)
		this.state = {
			needInit: false
		}
	}

	renderChart() {
		const { option, notMerge, lazyUpdate, config, geoJson } = this.props
		const chartDom = this.chart;
		const theme = (config && config.theme) || 'default';

		this.echart = echarts.getInstanceByDom(chartDom);

		if (!this.echart || this.state.needInit) {
			const series = option.series[0];
			if (series && series.type && series.type == 'map') {
				echarts.registerMap(series.mapType, geoJson);
			}
			this.echart = echarts.init(chartDom, theme)
			elementResizeEvent(chartDom, () => {
				if (this.mounted) {
					this.echart.resize();
				}
			})
		}

		if (config && config.hasOwnProperty('event')) {
			config.event.map(({ type, handler }) => this.echart.on(type, handler))
		}

		if (config && config.showLoading) {
			this.echart.showLoading('default', (config && config.loadingOption) || {
					text: '加载中...',
					color: '#c23531',
					textColor: '#000',
					maskColor: 'rgba(255, 255, 255, 0.8)',
					zlevel: 0
				})
		} else {
			this.echart.hideLoading()
			this.echart.setOption(option, notMerge, lazyUpdate)
		}
	}

	componentDidMount() {
		this.mounted = true;
		this.renderChart()
	}

	componentDidUpdate() {
		this.renderChart()
	}

	componentWillReceiveProps(nextProps) {
		//如果主题切换,需要重新创建实例,因为ECharts的主题设置api在init中,
		if (this.props.config.theme !== nextProps.config.theme) {
			this.setState({ needInit: true })
		}
	}

	componentWillUnmount() {
		this.mounted = false;
		echarts.dispose(this.chart);
	}

	render() {
		return <div ref={instance => this.chart = instance} className={this.props.className} style={this.props.style} />
	}
}


export default ECharts