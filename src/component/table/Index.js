import React, { Component, Fragment } from 'react';
import {
	Table
} from 'antd';
import jQuery from 'jquery';
import styles from './styles.module.less';

export default class extends Component {

	constructor(props) {
		super(props);
		this.table = React.createRef();
	}

	toggle = (e) => {
		let queryTarget = jQuery(e.target);
		this.toggleEvent(queryTarget);
	}

	toggleEvent = (queryTarget) => {
		const operaWrap = queryTarget.closest('[data-toggle]');
		const tr = operaWrap.closest('tr');

		if (operaWrap.hasClass('close')) {
			operaWrap.removeClass('close');
		} else {
			operaWrap.addClass('close');
		}
		tr.find('.ant-table-row-expand-icon').click();
	}

	componentDidMount() {
		jQuery(this.table).on('click', '[data-toggle]', this.toggle);
	}

	componentWillUnmount() {
		jQuery(this.table).off('click', '[data-toggle]', this.toggle);
	}

	render() {
		return <div className={styles.tableGap} ref={i => this.table = i}>
					<Table {...this.props} />
				</div>
	}
}
