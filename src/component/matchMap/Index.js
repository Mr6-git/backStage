import React, { Component, Fragment } from 'react';
import MatchItem from './MatchItem';

export default class extends Component {

	constructor(props) {
		super(props);
		this.state = {
			matchData: [
				{
					_id: '0',
					round: 0,
					index: 0
				}, {
					_id: '1',
					round: 0,
					index: 1
				}, {
					_id: '2',
					round: 0,
					index: 2
				}, {
					_id: '3',
					round: 0,
					index: 3
				}, {
					_id: '4',
					round: 1,
					index: 0,
					parent: [{
						_id: '0',
						round: 0,
						index: 0
					},{
						_id: '1',
						round: 0,
						index: 1
					}]
				}, {
					_id: '5',
					round: 1,
					index: 1,
					parent: [{
						_id: '2',
						round: 0,
						index: 2
					},{
						_id: '3',
						round: 0,
						index: 3
					}]
				}, {
					_id: '6',
					round: 2,
					index: 0,
					parent: [{
						_id: '4',
						round: 1,
						index: 0
					},{
						_id: '5',
						round: 1,
						index: 1
					}]
				}
			]
		}
		this.offset = { // 偏移值
			x: 70,
			y: 70
		}
	}

	renderLine(parent, current) {
		const offset = this.offset;
		const pLen = parent.length;
		let lineItems = [];
		if (pLen > 1) {
			lineItems = parent.map((item, index) => {
				const gapSize = Math.pow(2, item.round);
				const originX = offset.x + item.round * 300; // pitem - x
				const originY = offset.y + (item.index + 0.5) * 70 * gapSize; // pitem - y
				const firstY = originY + 25;
				const currentY = offset.y + (current.index + 0.5) * 70 * Math.pow(2, current.round);
				const secX = index == 0 ? currentY + 10 : currentY + 40;
				
				return <polyline
							points={`${originX + 200},${firstY} ${originX + 290},${firstY} ${originX + 290},${secX}`}
							style={{ fill: 'none', stroke: 'rgb(0, 0, 0)', strokeWidth: 1,}}
						/>
			})
		}
		return lineItems;
	}

	render() {
		return <div style={{overflow: 'auto'}}>
					<svg width={1416} height={1188} viewBox="0 0 1416 1188">
						<g >
							{this.state.matchData.map(item =>
								<Fragment key={item._id}>
									<MatchItem round={item.round} index={item.index} parent={item.parent} />
									{item.parent ? this.renderLine(item.parent, item) : null}
								</Fragment>
							)}
							{/* <polyline points="270,130 360,130 360,150" style={{ fill:'transparent', stroke:'black', strokeWidth: 1}} />
							<MatchItem round={0} index={0} />
							<MatchItem round={0} index={1} />
							<MatchItem round={0} index={2} />
							<MatchItem round={0} index={3} />
							<MatchItem round={1} index={0} parent={[{round: 0, index: 0}, {}]} />
							<MatchItem round={1} index={1} />
							<MatchItem round={2} index={0} /> */}
						</g>
					  </svg>
		  		</div>
	}
}
