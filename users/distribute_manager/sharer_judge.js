import React,{Component} from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView
}from 'react-native';
//引入公共头部
import Header from './../../common/header';
//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Icon from 'react-native-vector-icons/FontAwesome';
let checked = 'circle-o',unchecked = 'check-circle-o';
// 按钮组件
import Button from './../../common/button';
export default class SharerJudge extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading:true,
            is_pass:true,
            content:'',
        }
        this._data;
        this._log;
        this._sharerInfo;
    }
    getData(){
        let url = Utils.domain+'app/sharerApplys/toAudit';
        let postData = {
            tokenId:global.tokenId,
            id:this.props.id
        };
        Utils.post(
                  url,
                  postData,
                  (responData)=>{
                        if(responData.status==1){
                            this._data = responData.data.data;
                            this._data.domain = responData.data.domain;
                            this._log = responData.data.logs;
                            this._sharerInfo = responData.data.sharerInfo;
                            this.setState({loading:false});
                        }
                  },
                  (err)=>{
                    console.log('卖货商申请审核页面出错，',err);
                    Utils.msg('数据错误请联系管理员','top');
                    this.props.navigator.pop();
                  });


    }
    componentDidMount(){
        this.getData();
    }
    commit(){
        if(this.state.is_pass==false && this.state.content.length==0){
            Utils.msg('请填写不通过原因','top');
            return;
        }
        let url = Utils.domain+'app/sharerApplys/audit';
        let postData = {
            tokenId:global.tokenId,
            id:this.props.id,
            applyStatus:this.state.is_pass?this._sharerInfo.shareRank:0,
            refuseReason:this.state.content,
        }
        Utils.post(
            url,
            postData,
            (responData)=>{
                if(responData.status==1){
                    // 刷新上一页
                    this.props.refresh();
                    // 弹出当前页
                    this.props.navigator.pop();
                }
                Utils.msg(responData.msg,'top');
            },
            (err)=>{
                Utils.msg('提交失败,请重试','top');
                console.log('提交审核出错',err);   
            });
    }
    renderHeader(){
        return (<Header 
                    initObj={{backName:'',title:'审核'}} 
                    backEvent={()=>{this.props.navigator.pop()}}/>);
    }
    renderApplyStatus(){
        let code = [];
        switch(this._data.applyStatus){
            case 0:
            code = <Text style={styles.orange_box}>待后台管理员审核</Text>
            break;
            case 1:
                code = <Text style={styles.orange_box}>待钻石会员审核</Text>
            break;
            case 2:
                code = <Text style={styles.orange_box}>待黄金会员审核</Text>
            break;
            case 3:
                code = <Text style={styles.green_box}>审核通过</Text>
            break;
            case -1:
                code = <Text style={styles.red_box}>钻石会员不通过</Text>
            break;
            case -2:
                code = <Text style={styles.red_box}>黄金会员不通过</Text>
            break;
            case -3:
                code = <Text style={styles.red_box}>后台管理员不通过</Text>
            break;
            break;
        }
        return code;
    }
    // 渲染审核日志
    renderJudgeLog(){
        let code = [];
        for(let i in this._log){
            let _obj = this._log[i];
            code.push(<Text key={_obj.id} style={[styles.green_box,{marginBottom:5}]}>{_obj.logContext}  {_obj.createTime}</Text>);
        }
        return code;
    }
    render(){
        if(this.state.loading){
            return (
                <View style={styles.container}>
                {this.renderHeader()}
                {Utils.loading()}
                </View>
            );
        }
        return (
            <View style={styles.container}>
                {this.renderHeader()}
                <ScrollView style={styles.main}>
                    {
                        this._log!=undefined && this._log.length>0
                        ?
                        <View style={[styles.item,styles.row]}>
                            <Text style={styles.item_l}>审核日志：</Text>
                            <View style={[styles.item_r]}>
                                {this.renderJudgeLog()}
                            </View>
                        </View>
                        :
                        null
                    }

                    <View style={[styles.item,styles.row]}>
                        <Text style={styles.item_l}>审核状态：</Text>
                        <View style={[styles.item_r,styles.row]}>
                            {this.renderApplyStatus()}
                        </View>
                    </View>
                    <View style={[styles.item,styles.row]}>
                        <Text style={styles.item_l}>姓名：</Text>
                        <View style={[styles.item_r,styles.row]}>
                            <Text>{this._data.sharerName}</Text>
                        </View>
                    </View>
                    <View style={[styles.item,styles.row]}>
                        <Text style={styles.item_l}>电话：</Text>
                        <View style={[styles.item_r,styles.row]}>
                        <Text>{this._data.sharerPhone}</Text>
                        </View>
                    </View>
                    <View style={[styles.item,styles.row]}>
                        <Text style={styles.item_l}>邮箱：</Text>
                        <View style={[styles.item_r,styles.row]}>
                            <Text>{this._data.sharerEmail}</Text>
                        </View>
                    </View>
                    <View style={[styles.item,styles.row]}>
                        <Text style={styles.item_l}>微信：</Text>
                        <View style={[styles.item_r,styles.row]}>
                            <Text>{this._data.sharerWeixin}</Text>
                        </View>
                    </View>
                    <View style={[styles.item,styles.row]}>
                        <Text style={styles.item_l}>申请说明：</Text>
                        <View style={[styles.item_r,styles.row]}>
                            <Text>{this._data.applyContent}</Text>
                        </View>
                    </View>
                    <View style={[styles.item,styles.row]}>
                        <Text style={styles.item_l}>身份证正面：</Text>
                        <View style={[styles.item_r,styles.row]}>
                            <Image source={{uri:this._data.domain+this._data.identityCardImg1}} style={styles.id_cart_img}/>
                        </View>
                    </View>
                    <View style={[styles.item,styles.row]}>
                        <Text style={styles.item_l}>身份证反面：</Text>
                        <View style={[styles.item_r,styles.row]}>
                            <Image source={{uri:this._data.domain+this._data.identityCardImg2}} style={styles.id_cart_img}/>
                        </View>
                    </View>
                    {
                        this._sharerInfo.shareRank==this._data.applyStatus
                        ?
                        <View>
                            <View style={[styles.item,styles.row]}>
                                <Text style={styles.item_l}>审核状态：</Text>
                                <View style={[styles.item_r,styles.row]}>
                                    <TouchableOpacity style={[styles.row,styles.check_box]} activeOpacity={0.8} onPress={()=>this.setState({is_pass:true})}>
                                        {
                                            this.state.is_pass==1
                                            ?
                                            <Icon name={unchecked} size={20} color={'red'} />
                                            :
                                            <Icon name={checked} size={20} color={'rgba(0, 0, 0, 0.3)'}/>

                                        }
                                        <Text> 通过</Text>

                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.row,styles.check_box]} activeOpacity={0.8} onPress={()=>this.setState({is_pass:false})}>
                                        {
                                            this.state.is_pass==1
                                            ?
                                            <Icon name={checked} size={20} color={'rgba(0, 0, 0, 0.3)'}/>
                                            :
                                            <Icon name={unchecked} size={20} color={'red'} />
                                        }
                                        <Text> 不通过</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {
                                this.state.is_pass==false
                                ?
                                <KeyboardAvoidingView 
                                    behavior="padding"
                                    style={[styles.item,styles.row]}>
                                    <Text style={styles.item_l}>不通过原因：</Text>
                                    <View style={[styles.item_r]}>
                                        <TextInput 
                                            placeholder={'请填写审核不通过原因~'}
                                            placeholderTextColor={'#999'}
                                            onChangeText={(val)=>this.setState({content:val})}
                                            style={styles.text_input}
                                            multiline={true}
                                            underlineColorAndroid={'transparent'}/>
                                    </View>
                                </KeyboardAvoidingView>
                                :
                                null
                            }
                            <View style={[styles.item,styles.row,styles.center]}>
                                <Button 
                                onPress={()=>this.commit()} 
                                style={[styles.commit_btn,styles.center]} 
                                textStyle={[styles.btn_text]} text={'提交'}/>
                            </View>
                        </View>
                        :
                        null
                    }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#fff',
    },
    flex_1:{flex:1},
    center:{justifyContent:'center',alignItems:'center'},
    row:{flexDirection:'row'},
    item:{
        paddingHorizontal:15,
        paddingVertical:5,
        alignItems:'center',
    },
    item_r:{flex:1},
    id_cart_img:{
        width:100,
        height:100
    },
    text_input:{
        width:'100%',
        textAlignVertical:'top',
        minHeight:height*0.15,
        fontSize:13,
        borderWidth:1,
        borderColor:'#eee',
    },
    check_box:{
        marginRight:15,
    },
    // 上传按钮
	commit_btn:{
		marginTop:15,
		width:width*0.6,
		padding:8,
		borderRadius:6,
		backgroundColor:'#d82a2e',
	},
	btn_text:{
		color:'#fff',
		fontSize:15,
    },
    orange_box:{
        color:'orange'
    },
    green_box:{
         color:'green'
     },
     red_box:{
         color:'red'
     },
});