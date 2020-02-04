import React, { Component, Fragment } from 'react';
import {
	Tag,
	Icon,
	Menu,
	Button,
	Tooltip,
	message,
	Dropdown,
	Checkbox,
} from 'antd';
import NetOperation from '@/net/operation';
import TagsAdded from './TagsAdded';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const MenuItem = Menu.Item;

export default class extends Component {

	constructor(props) {
		super(props);
		this.state = {
			tags: this.props.tags,
			tagMenu: [],
			inputVisible: false,
			inputValue: '',
			visible: false,
			isLoading: false,
		}
	}

	componentWillMount() {
		this.getTagData();
	}

	getTagData() {
		NetOperation.getTags().then(res => {
			const tagMenu = res.data.map(item => item.name);
			this.setState({
				tagMenu,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleClose = (removeTag) => {
		const { tags } = this.state;
		this.setState({
			tags: tags.filter(tag => tag != removeTag)
		});
	}

	handleInputConfirm = (value) => {
		const state = this.state;
		const inputValue = value;
		let tags = state.tags;
		if (inputValue && tags.indexOf(inputValue) === -1) {
			tags = [...tags, inputValue];
		}
		this.setState({
			tags,
			inputVisible: false,
		});
	}

	handleVisibleChange = (flag) => {
		this.setState({ visible: flag });
	}

	showInput = () => {
		this.setState({
			inputVisible: true,
		});
	}

	closeInput = () => {
		this.setState({
			inputVisible: false,
		});
	}

	addTags(e, value) {
		const state = this.state;
		let tags = state.tags;
		if (e.target.checked) {
			if (value && tags.indexOf(value) === -1) {
				tags = [...tags, value];
			}
		} else {
			for (let i = tags.length - 1; i >= 0; i--) {
				if (tags[i] == value) {
					tags.splice(i, 1);
				}
			}
		}
		
		this.setState({
			tags,
		});
		
	}

	commit = (e) => {
		e && e.preventDefault();
		const { isLoading, tags } = this.state;
		const data = {
			tags: tags,
		};
		if (isLoading) return;
		this.setState({
			isLoading: true,
		}, () => {
			this.postData(data);
		})
	}

	postData(data) {
		const props = this.props;
		const _id = props.id;
		NetOperation.editCustomerTags(_id, data).then((res) => {
			props.onClose();
			props.getData();
			message.success('编辑成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	renderMenu() {
		const { tagMenu } = this.state;
		return <Menu>
					{tagMenu.map((item, index) => 
						<MenuItem
							key={index}
						>
							<Checkbox
								onChange={(e) => { this.addTags(e, item); }}
							>{item}</Checkbox>
						</MenuItem>
					)}
				</Menu>
	}

	render() {
		const { inputVisible, tags } = this.state;
		let tagsContent = null;
		if (tags.length) {
			tagsContent = tags.map((tag, index) => {
				const isLongTag = tag.length > 20;
				const tagElem = (
					<Fragment key={index}>
						{tag != '' ? 
							<Tag
								key={tag}
								closable
								onClose={() => this.handleClose(tag)}
							>
							{isLongTag ? `${tag.slice(0, 20)}...` : tag}
							</Tag> : null
						}
					</Fragment>
				);
				return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
			});
		}
		return <div
					className={globalStyles.modalForm}
					key="parent"
				>
					<div className={styles.tagsBox}>
						{tagsContent}
					</div>
					<div className={inputVisible ? styles.flexCenterVer : null}>
						<Dropdown
							overlay={this.renderMenu()}
							onVisibleChange={this.handleVisibleChange}
							visible={this.state.visible}
							overlayStyle={{ maxHeight: 250, overflow: 'auto' }}
						>
							<Button style={{ marginRight: 10 }}>
								已有标签 <Icon type="down" />
							</Button>
						</Dropdown>
						{inputVisible && <TagsAdded onConfirm={this.handleInputConfirm} onClose={this.closeInput} />}
						{!inputVisible && (
							<Tag
								onClick={this.showInput}
								style={{ background: '#fff', border: 'none', color: '#1890FF' }}
							>
								<Icon type="plus" /> 添加标签
							</Tag>
						)}
					</div>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button
							type="primary"
							loading={this.state.isLoading}
							onClick={this.commit}
						>
							确定
						</Button>
					</div>
				</div>
	}
}
