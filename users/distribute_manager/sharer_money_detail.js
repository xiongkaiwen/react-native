/**
 * 分佣详情页面
 */
import React,{Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    InteractionManager
} from 'react-native';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
let {width,height} = Utils;
export default class SharerMoneyDetail extends Component{
    constructor(props){
        super(props);
        this._data = {};
        this.state = {
            loading:true
        }
    }
    getData(){
        let url = Utils.domain+'app/sharerMoneys/getById';
        let postData = {
            tokenId:global.tokenId,
            id:this.props.id
        }
        Utils.post(
                   url,
                   postData,
                   responseData=>{
                        this._data = responseData.data;
                        this.setState({loading:false});
                   },
                   err=>{
                       Utils.msg('数据出错，请联系管理员','top');
                       this.props.navigator.pop();
                       console.log('分佣详情出错',err);
                   }
                 )
    }
    componentDidMount(){
        InteractionManager.runAfterInteractions(() => {
            // 调用方法请求数据
            this.getData();
        });	
    }
    // 渲染头部
    renderHeader(){
        return(<Header 
                initObj={{backName:'',title:'分佣详情'}} 
                backEvent={()=>{this.props.navigator.pop()}}/>);
    }
    render(){
        // 请求数据中
        if(this.state.loading){
            return (
                <View style={[styles.contrainer]}>
                    {this.renderHeader()}
                    {Utils.loading()}
                </View>
            );
        }
        return (
            <View style={styles.contrainer}>
                {this.renderHeader()}
                <Text style={[styles.c15_333,styles.center]}>
                    {this._data.createTime}{this._data.remark}
                    {'\n'}
                    佣金：￥{this._data.shareMoney}
                    {'\n'}
                    积分：{this._data.shareScore}
                </Text>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    contrainer:{
        flex:1,
        backgroundColor:'#fff'
    },
    c15_333:{
        fontSize:15,
        color:'#333',
        paddingHorizontal:15,
        paddingTop:15,
    },
    center:{
		justifyContent:'center',
		alignItems:'center',
	},
	j_center:{justifyContent:'center'},
	a_center:{alignItems:'center'},
	row:{flexDirection:'row'},

});