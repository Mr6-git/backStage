import React, { Component, Fragment } from 'react';
import moment from 'moment';
import {
    Menu,
    Tabs,
    Radio,
    DatePicker,
} from 'antd';
import styles from '../../styles.module.less';
import TicketInfo from './addTicket/TicketInfo';
import Introduction from './addTicket/Introduction'
import Session from './addTicket/Session';
import { Steps } from 'antd';

const { Step } = Steps;

export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            tagMap: {},
            fieldMap: [], // 字段编辑器列表
            activeTab: '0',
            scenes_id: '',
            ticket_id: '',
            stepIndex: 0
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        localStorage.removeItem('ticketFirst');
        localStorage.removeItem('ticketSec');
    }

    nextStep = (data) => {
        this.setState({
            data: data
        })
    }

    stepIndex = (index) => {
        this.setState({
            stepIndex: index
        })
    }

    getTicketId = (id) => {
        this.setState({
            ticket_id: id
        })
    }

    getId = (id) => {
        this.setState({
            scenes_id: id
        })
    }

    lastStep = (index) => {
        this.setState({
            stepIndex: index
        })
    }

    render() {
        const { stepIndex, data, scenes_id, ticket_id} = this.state;
        return <div className={styles.detailWrap}>
            <div className={styles.progress}>
                <Steps current={stepIndex}>
                    <Step title="赛事信息" />
                    <Step title="简介详情" />
                    <Step title="设置门票" />
                </Steps>
            </div>
            <div>
                {stepIndex == 0 && <div style={{ background: '#fff', }}>
                    <TicketInfo next={this.nextStep} {...this.props} stepIndex={this.stepIndex} />
                </div>
                }
                {stepIndex == 1 && <div style={{ background: '#fff' }}>
                    <Introduction next={this.nextStep} data={data} {...this.props} ticket_id={ticket_id} getTicketId={this.getTicketId} lastStep={this.lastStep} stepIndex={this.stepIndex}/>
                </div>
                }
                {stepIndex == 2 && <div style={{ background: '#fff'}}>
                    <Session {...this.props} id={ticket_id} stepIndex={this.stepIndex}/>
                </div>
                }
            </div>

        </div>
    }
}