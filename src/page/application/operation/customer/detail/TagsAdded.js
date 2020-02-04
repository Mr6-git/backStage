import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Button,
} from 'antd';
import styles from '../styles.module.less';

const FormItem = Form.Item;

class TagsAdded extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.props.onConfirm(values.tag);
			}
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return (
				<Form
					onSubmit={this.handleSubmit}
					style={{ marginTop: '-3px', width: '360px' }}
					key="child"
				>
					<FormItem style={{ marginBottom: '0px' }}>
						<Row gutter={2}>
							<Col span={16}>
								{getFieldDecorator('tag', {
									rules: [
										{ max: 10, message: '不得多于10个字符' },
										{ required: true, message: '至少一个字符' },
									],
								})(
									<Input 
										type="text"
										placeholder="请输入标签名称（10个字符）"
										autoFocus
									/>
								)}
							</Col>
							<Col span={8}>
								<Button 
									htmlType="submit"
									className={styles.submitBtn}
								>提交</Button>
								<Button
									className={styles.cancelBtn}
									onClick={this.props.onClose}
								>取消</Button>
							</Col>
						</Row>
					</FormItem>
				</Form>
			
		);
	}
}

export default Form.create()(TagsAdded);
