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
import E from 'wangeditor';

const FormItem = Form.Item;
const { TextArea } = Input;

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            previewImage: '',
            previewBackVisible: false,
            matchFile: {},
            matchUrl: '',
            match_url: '',

            infoData: {}
        };
        this.formItemLayout = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 10
            }
        };
        this.editor = React.createRef();
    }

    componentDidMount() {
        const info = this.props.data,
            backData = localStorage.getItem('ticketSec'),
            _backData = backData ? JSON.parse(backData) : {},
            data = backData && backData != null ? _backData : info;
        let matchUrl;
        if (data.match_img != "") {
            if (data.match_img.indexOf('http') == -1) {
                matchUrl = `${process.env.REACT_APP_ASSETS_API}${data.match_img}`
            } else {
                matchUrl = data.match_img
            }
        } else {
            matchUrl = data.match_img
        }
        this.setState({
            infoData: data,
            matchUrl: matchUrl,
            match_url: matchUrl
        })

        const editor = new E(this.editor);
        editor.customConfig.uploadImgServer = NetSystem.getUploadUrl()
        editor.customConfig.uploadFileName = 'file';
        editor.customConfig.uploadImgMaxLength = 1;
        editor.customConfig.withCredentials = true

        editor.customConfig.menus = [
            'head',  // 标题
            'bold',  // 粗体
            'fontName',  // 字体
            'italic',  // 斜体
            'underline',  // 下划线
            'strikeThrough',  // 删除线
            'foreColor',  // 文字颜色
            'backColor',  // 背景颜色
            'link',  // 插入链接
            'list',  // 列表
            'justify',  // 对齐方式
            'quote',  // 引用
            'image',  // 插入图片
            'table',  // 表格
        ]

        editor.customConfig.uploadImgHeaders = {
            'Accept': 'multipart/form-data'
        };

        editor.customConfig.uploadImgHooks = {
            customInsert: function (insertImg, result, editor) {
                insertImg(result.url)
            }
        };

        editor.customConfig.onchange = () => {
            this.setState({ content: editor.txt.html() });
        };

        editor.create();
        editor.txt.html(data.introduction);
    }

    commint = (e) => {
        const { matchUrl, match_url, infoData } = this.state;
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let content = this.state.content || infoData.introduction;
                if (!content) {
                    message.warning('请上传赛事简介');
                    return;
                }
                content = content.replace(/<[^>]+microsoft>/g, '');
                content = content.replace(/<[^>]+microsoft[^>]+>/g, '');

                let data = this.props.data,
                    coverurl,
                    matchurl;
                if (data.cover_img.indexOf('http') != -1) {
                    coverurl = data.cover_img.replace(process.env.REACT_APP_ASSETS_API, '')
                } else {
                    coverurl = data.cover_img
                }
                if (match_url) {
                    if (match_url.indexOf('http') != -1) {
                        matchurl = match_url.replace(process.env.REACT_APP_ASSETS_API, '')
                    } else {
                        matchurl = match_url
                    }
                } else {
                    matchurl = match_url
                }
                let formdata = {
                    'ticket_name': data.ticket_name,
                    'start_time': data.start_time,
                    'city': data.city,
                    'introduction': content || infoData.introduction,
                    'address': data.address,
                    'location': data.location,
                    'cover_img': coverurl,
                    'match_img': matchurl ? matchurl : '',
                    'description': data.description,
                    'seating_img': '',
                    'buy_limit': data.buy_limit ? data.buy_limit * 1 : '',
                    'order': data.order ? data.order * 1 : '',
                    'lat': data.lat + '' || infoData.lat,
                    'lng': data.lng + '' || infoData.lng
                };

                localStorage.setItem('ticketSec', JSON.stringify({
                    introduction: content,
                    match_img: match_url ? match_url : '',
                }))

                this.postData(formdata);
            }
        });
    }

    postData(data) {
        if (this.state.loading) return;
        this.setState({
            loading: true
        });
        NetMall.editTicket(this.props.id, data).then((res) => {
            message.success('编辑成功');
            const id = res.data.id;
            this.props.getTicketId(id);
            this.props.stepIndex(2)
        }).catch((e) => {
            message.error(e.msg);
            this.setState({
                loading: false
            })
        });
    }

    stepIndex = () => {
        this.props.stepIndex(0)
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
                    case 'match':
                        this.state.matchUrl = '';
                        this.state.matchFile = {};
                        this.setState({
                            match_url: ''
                        });
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
    clashChangeIcon = (info) => {
        if (!utils.beforeUpload(info.file.originFileObj)) return;
        utils.getBase64(info.file.originFileObj, uploadAva => {
            this.setState({
                matchUrl: uploadAva,
                matchFile: info.file.originFileObj
            })
            let data = new FormData();
            data.append('file', info.file.originFileObj);
            NetSystem.uploadFile(data).then(res => {
                let url = res.url.replace(process.env.REACT_APP_ASSETS_API, '');
                this.setState({
                    match_url: url
                })
            }).catch(err => {

            })
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { loading, previewImage, previewBackVisible, matchUrl, fileList } = this.state;
        const formItemLayout = this.formItemLayout;
        return <FormItem>
            <Form onSubmit={this.commint} className={classnames(globalStyles.inputGap, globalStyles.modalForm)} >
                <FormItem label={
                    <Fragment>
                        <span className="ant-form-item-required"></span>
                        <span>赛事简介</span>
                    </Fragment>
                } {...formItemLayout}>
                    <div ref={i => this.editor = i} className={globalStyles.editor}></div>
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={
                        <Fragment>
                            {/* <span className="ant-form-item-required"></span> */}
                            <span>对阵图</span>
                        </Fragment>
                    }
                >
                    {matchUrl ? (
                        <div className={styles.avaImgWrap}>
                            <img
                                src={matchUrl}
                                className={styles.avatarImg}
                                alt=""
                                onClick={() => { this.handlePreview(matchUrl) }}
                            />
                            <Icon
                                type="close-circle" theme="filled"
                                style={{ fontSize: 18 }}
                                className={styles.closeIcon}
                                onClick={() => { this.handleRemove('match') }}
                            />
                        </div>
                    ) : (
                            <Upload
                                name="avatar"
                                customRequest={() => { }}
                                listType="picture-card"
                                showUploadList={false}
                                onChange={this.clashChangeIcon}
                                accept="image/*"
                                fileList={fileList}
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
                <div className={styles.footer}>
                    <Button className={styles.lastBtn} onClick={this.stepIndex} loading={loading}>
                        上一步
                    </Button>
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
