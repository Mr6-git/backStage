import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import styles from './styles.module.less';

class NumberItem extends Component {
	constructor(props) {
		super();
		this.state = {
			number: Array.apply(null, {length: 10}),
			styles: {}
		}
	}
	componentDidMount() {
		if (this.props.value != 0) {
			setTimeout(() => {
				this.setState({
					styles: {transform: `translateY(-${100 * this.props.value}%)`}
				})
			}, 5)
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.value != this.props.value) {
			this.state.styles = {transform: `translateY(-${100 * nextProps.value}%)`};
		}
	}
	render() {
		return <span className={styles.animateNumber}>
					<span style={this.state.styles}>
						{this.state.number.map((item, index) => {
							return <span key={index}>{index % 10}</span>
						})}
					</span>
				</span>
	}
}

export default class extends Component {
	render() {
		let { value, className, prev, fixed, ...props } = this.props;
		let _fixed = fixed != null || fixed != undefined ? fixed : '2';
		let left = null, right = null, leftArr = null, rightArr = null;
		if (_fixed != 0) {
			value = value.toFixed('2');
			left = value.substr(0, value.length - 3);
			right = value.substr(-2);
			leftArr = left.split('');
			rightArr = right.split('');
		} else {
			value = value.toFixed('0');
			leftArr = value.split('');
		}
		let length = leftArr.length;

		return <span {...props} className={classnames(styles.animateBox, className)}>
					{prev}
					{leftArr.map((item, i) => {
						let position = (length - i - 1);
						return <Fragment key={position}>
									<NumberItem value={parseInt(item)} />
									{(position != 0 && position % 3 == 0) ? <span>,</span> : undefined}
								</Fragment>
					})}
					{_fixed == '2' ? (
						<Fragment>
							<span>.</span>
							{rightArr.map((item, i) => {
								return <NumberItem value={parseInt(item)} key={i} />
							})}
						</Fragment>
					) : null}
					
				</span>
	}
}
