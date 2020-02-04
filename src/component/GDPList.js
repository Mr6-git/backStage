import React, { Component } from 'react';
import {
	List,
	Row,
	Col,
} from 'antd';
import PropTypes from 'prop-types';

export default class extends Component {
	static propTypes = {
		data: PropTypes.array,
		header: PropTypes.array
	}
	static defaultProps = {
		data: {},
		header: []
	}
	render() {
		const { data, header } = this.props;
		if (header.length != 3) return;
		return <List
					size="small"
					style={{ marginRight: '10px' }}
					header={(
						<Row>
							<Col span={header[0].width}>{header[0].title}</Col>
							<Col span={header[1].width} style={{ textAlign: 'right' }}>{header[1].title}</Col>
							<Col span={header[2].width} style={{ textAlign: 'right' }}>{header[2].title}</Col>
						</Row>
					)}
					bordered={false}
					dataSource={data}
					renderItem={item => (
						<Row>
							<Col span={header[0].width}>{item.name}</Col>
							<Col span={header[1].width} style={{ textAlign: 'right' }}>{item.value}</Col>
							<Col span={header[2].width} style={{ textAlign: 'right' }}>{item.ratio}</Col>
						</Row>
					)}
				/>
	}
}