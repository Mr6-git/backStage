import React, { Component, Fragment } from 'react';
import {
	Col,
	Row,
	Button
} from 'antd';
import styles from '@/resource/css/notFund.module.less';

import notFundImg from '@/resource/images/404.svg';

const NotFund = (props) => {
	return <div className={styles.notFund}>
				<Row gutter={80}>
					<Col md={12} sm={24} xs={24}>
						<div className={styles.flexEnd}>
							<img className={styles.notFundImg} src={notFundImg} alt="" />
						</div>
					</Col>
					<Col md={8} sm={24} xs={24}>
						<div className={styles.right}>
							<h1>404</h1>
							<div className={styles.tip}>抱歉，你访问的页面不存在</div>
							<Button
								type="primary"
								style={{ width: '88px' }}
								onClick={() => {
									props.history.push(`${props.match.url}/overview`)
								}}
							>返回首页</Button>
						</div>
					</Col>
				</Row>
			</div>
}

export default NotFund
