import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types'
export default class extends Component {
	static propTypes = {
		index: PropTypes.number.isRequired, // 这一轮第几个队伍
		round: PropTypes.number.isRequired, // 第几轮
		offset: PropTypes.shape({ // 原点 偏移值
			x: PropTypes.number.isRequired, 
			y: PropTypes.number.isRequired
		}),
		before: PropTypes.func,
		after: PropTypes.func
	}

	static defaultProps = {
		offset: { // 默认原点 偏移值
			x: 70,
			y: 70
		}
	}

	render() {
		const props = this.props;
		const gapSize = Math.pow(2, props.round);
		const originX = props.offset.x + props.round * 300; // 计算结果
		const originY = props.offset.y + (props.index + 0.5) * 70 * gapSize; // 计算结果

		return <g>
					{this.props.before && this.props.before(originX, originY)}
					<text fontSize={13} textAnchor="end" x={originX - 6} y={originY + 30} style={{fill: 'rgb(125, 125, 125)'}}>
						0
					</text>
					<g>
						<rect x={originX} y={originY} width={200} height={25} style={{fill: 'rgb(0, 0, 0)'}} />
						<image x={originX + 5} y={originY + 3} height={20} width={30} xlinkHref="http://djq-img.oss-cn-hangzhou.aliyuncs.com/country/0.jpg" />
						<text x={originX + 40} y={originY + 17} fontSize={13} style={{fill: 'rgb(184, 186, 188)'}}>
							暂无
						</text>
						<text x={originX + 188} y={originY + 17} textAnchor="end" fontSize={13} style={{fill: 'rgb(184, 186, 188)'}}>
							-
						</text>
					</g>
					<line x1={originX} x2={originX + 200} y1={originY + 25} y2={originY + 25} style={{stroke: 'rgb(255, 255, 255)', strokeWidth: 1}} />
					<g>
						<rect x={originX} y={originY + 25} width={200} height={25} style={{fill: 'rgb(0, 0, 0)'}} />
						<image x={originX + 5} y={originY + 3 + 25} height={20} width={30} xlinkHref="http://djq-img.oss-cn-hangzhou.aliyuncs.com/country/0.jpg" />
						<text x={originX + 40} y={originY + 17 + 25} fontSize={13} style={{fill: 'rgb(184, 186, 188)'}}>
							暂无
						</text>
						<text x={originX + 188} y={originY + 17 + 25} textAnchor="end" fontSize={13} style={{fill: 'rgb(184, 186, 188)'}}>
							-
						</text>
					</g>
					{this.props.after && this.props.after(originX, originY)}
				</g>
	}
}
