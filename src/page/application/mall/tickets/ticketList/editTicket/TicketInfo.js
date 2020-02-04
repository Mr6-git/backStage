import React, { Component, Fragment } from 'react';
import {
    Form,
    Input,
    Button,
    message,
    Modal,
    Upload,
    Icon,
} from 'antd';
import utils, { Event } from '@/utils';
import classnames from 'classnames';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import NetMall from '@/net/mall';
import NetSystem from '@/net/system';
import GdMap from './GdMap';

const FormItem = Form.Item;
const { TextArea } = Input;

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            uploadQrCode: '',
            previewImage: '',
            previewBackVisible: false,
            coverFile: {},
            coverUrl: '',
            cover_url: '',
            formattedAddress: '',
            lat: '',
            lng: '',
            data: [],
            infoData: {},

            info: null,
        };
        this.formItemLayout = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 7
            }
        };
        this.formNumLayout = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 2
            }
        }
    }

    componentWillReceiveProps(nexProps) {
    }

    componentDidMount() {
        this.getData();
    }

    getData = () => {
        const _id = this.props.id;
        NetMall.getTicket(_id).then(res => {
            const info = res.data,
                backData = localStorage.getItem('ticketFirst'),
                _backData = backData ? JSON.parse(backData) : {},
                data = backData && backData != null ? _backData : info;
            let coverUrl;
            if (data.cover_img.indexOf('http') == -1) {
                coverUrl = `${process.env.REACT_APP_ASSETS_API}${data.cover_img}`
            }else{
                coverUrl = data.cover_img
            }
            this.setState({
                infoData: data,
                coverUrl: coverUrl,
                cover_url: coverUrl
            })
        }).catch(err => {
            if (err.msg || process.env.NODE_ENV != 'production') {
                message.error(err.msg);
            }
        })
    }

    commint = (e) => {
        const { coverUrl, cover_url, lat, lng, infoData } = this.state;
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (!coverUrl) {
                    message.warning('请上传封面图片');
                    return;
                }
                let formdata = {
                    'ticket_name': values.ticket_name,
                    'start_time': values.start_time,
                    'city': values.city,
                    'address': values.address,
                    'location': values.location,
                    'cover_img': cover_url || coverUrl.replace(process.env.REACT_APP_ASSETS_API, ''),
                    'description': values.description ? values.description : '',
                    'buy_limit': values.buy_limit ? values.buy_limit * 1 : '',
                    'order': values.order ? values.order * 1 : '',
                    'lat': lat + '' || infoData.lat,
                    'lng': lng + '' || infoData.lng,
                    'match_img': infoData.match_img,
                    'introduction': infoData.introduction
                };

                localStorage.setItem('ticketFirst', JSON.stringify(formdata));

                this.props.next(formdata);
                this.props.stepIndex(1);
                this.props.getTicketId(this.props.id);
            }
        });
    }


    handleRemove(flag) {
        Modal.confirm({
            title: '确认提示',
            content: '确认删除该图片吗？',
            okText: '确定',
            cancelText: '取消',
            centered: true,
            onOk: () => {
                switch (flag) {
                    case 'cover':
                        this.state.coverUrl = '';
                        this.state.coverFile = {};
                        this.setState({});
                        break;
                }
            },
            onCancel() { },
        });
    }

    handleCancel = () => {
        this.state.previewBackVisible = false;
        this.setState({});
    }

    handlePreview = (previewImage) => {
        this.state.previewBackVisible = true
        this.setState({
            previewImage,
        });
    }

    //上传封面图
    coverChangeIcon = (info) => {
        if (!utils.beforeUpload(info.file.originFileObj)) return;
        utils.getBase64(info.file.originFileObj, uploadAva => {
            this.setState({
                coverUrl: uploadAva,
                coverFile: info.file.originFileObj
            })
            let data = new FormData();
            data.append('file', info.file.originFileObj);
            NetSystem.uploadFile(data).then(res => {
                let url = res.url.replace(process.env.REACT_APP_ASSETS_API, '');
                this.setState({
                    cover_url: url
                })
            }).catch(err => {

            })
        });
    }

    openMap = () => {
        const options = {
            title: '选择导航',
            width: 848,
            footer: null,
            centered: true,
            maskClosable: false,
            zIndex: 1001
        }
        Event.emit('OpenModule', {
            module: <GdMap
                onClose={this.onClose}
                chooseMap={this.chooseMap}
            // onChange={this.onChange}
            />,
            props: options,
            parent: this
        });
    }

    chooseMap = (mapData) => {
        this.setState({
            formattedAddress: mapData.addr,
            lat: mapData.latitude,
            lng: mapData.longitude,
        })
        this.props.form.setFieldsValue({
            address: mapData.addr,
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading, previewImage, previewBackVisible, coverUrl, infoData, } = this.state;
        const formItemLayout = this.formItemLayout;
        const formNumLayout = this.formNumLayout;
        return <FormItem>
            <Form onSubmit={this.commint} className={classnames(globalStyles.inputGap, globalStyles.modalForm)} >
                <FormItem label="门票名称" {...formItemLayout}>
                    {getFieldDecorator('ticket_name', {
                        initialValue: infoData.ticket_name,
                        rules: [
                            { required: true, message: '请输入门票名称' }
                        ],
                    })(
                        <Input placeholder="请输入" />
                    )}
                </FormItem>
                <FormItem label="比赛时间" {...formItemLayout}>
                    {getFieldDecorator('start_time', {
                        initialValue: infoData.start_time,
                        rules: [
                            { required: true, message: '请输入比赛时间' }
                        ],
                    })(
                        <Input placeholder="请输入" />
                    )}
                </FormItem>
                <FormItem label="比赛城市" {...formItemLayout}>
                    {getFieldDecorator('city', {
                        initialValue: infoData.city,
                        rules: [
                            { required: true, message: '请输入比赛地址' }
                        ],
                    })(
                        <Input placeholder="请输入" />
                    )}
                </FormItem>
                <FormItem label="举办地址" {...formItemLayout}>
                    {getFieldDecorator('location', {
                        initialValue: infoData.location,
                        rules: [
                            { required: true, message: '请输入举办地址' }
                        ],
                    })(
                        <Input placeholder="请输入" />
                    )}
                </FormItem>
                <FormItem label="详细地址" {...formItemLayout} className={styles.chooseAttr}>
                    {getFieldDecorator('address', {
                        initialValue: infoData.address,
                        rules: [
                            { required: true, message: '请输入比赛详细地址' }
                        ],
                    })(
                        <Input disabled placeholder="请输入" />
                    )}
                    <div className={styles.attrBtn}><span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={this.openMap}>选择导航</span></div>
                </FormItem>
                <FormItem label="描述" {...formItemLayout}>
                    {getFieldDecorator('description', {
                        initialValue: infoData.description,
                        rules: [
                            { required: true, message: '请输入描述' }
                        ],
                    })(
                        <Input placeholder="请输入" />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={
                        <Fragment>
                            <span className="ant-form-item-required"></span>
                            <span>封面图</span>
                        </Fragment>
                    }
                >
                    {coverUrl ? (
                        <div className={styles.avaImgWrap}>
                            <img
                                src={coverUrl}
                                className={styles.avatarImg}
                                alt=""
                                onClick={() => { this.handlePreview(coverUrl) }}
                            />
                            <Icon
                                type="close-circle" theme="filled"
                                style={{ fontSize: 18 }}
                                className={styles.closeIcon}
                                onClick={() => { this.handleRemove('cover') }}
                            />
                        </div>
                    ) : (
                            <Upload
                                name="avatar"
                                customRequest={() => { }}
                                listType="picture-card"
                                showUploadList={false}
                                onChange={this.coverChangeIcon}
                                accept="image/*"
                            >
                                <div className={styles.avaUpload}>
                                    <Icon type={'plus'} style={{ marginTop: 10, fontSize: 20 }} />
                                </div>
                            </Upload>
                        )}
                    <Modal visible={previewBackVisible} footer={null} closable={false} onCancel={() => { this.handleCancel('recharge') }}>
                        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                    <div>尺寸建议750*750（正方形模式），大小2M以下，最多1张</div>
                </FormItem>
                <FormItem label="单次购买上限" {...formNumLayout}>
                    {getFieldDecorator('buy_limit', {
                        initialValue: infoData.buy_limit,
                        rules: [
                            { required: true, message: '请输入限购数量' }
                        ],
                    })(
                        <Input type="number" placeholder="请输入" />
                    )}
                </FormItem>
                <FormItem label="排序" {...formNumLayout}>
                    {getFieldDecorator('order', {
                        initialValue: infoData.order,
                        rules: [
                            { required: true, message: '请输入排序' }
                        ],
                    })(
                        <Input placeholder="请输入" />
                    )}
                </FormItem>
                <div className={styles.footer}>
                    <Button className={styles.nextBtn} htmlType="submit" type="primary" loading={loading}>
                        下一步
                </Button>
                    {/* <div className={styles.nextBtn} onClick={this.next}>下一步</div> */}
                </div>
            </Form>

        </FormItem>
    }
}

export default Form.create()(Create);
