/**
* 账户安全
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo,
  InteractionManager
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
//图标组件
import Icon from 'react-native-vector-icons/FontAwesome';

//支付密码
import PayPass from './paypass';
//手机号码
import Phone from './phone';
var securityData;
export default class Complaint extends Component {
	constructor(props){
		super(props);
		this.state={};
		// 是否有网络
		this.state.isConnected = true;
		// 是否加载数据
		this.state.loadData = false;
		
		this.success = this.success.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	securityData = data.data;
	if(securityData){
		this.setState({
			loadData:true,
		  });
		}else{
			this.setState({
				loadData:true,
			 });
		}
	}

 // 获取数据
  getData(){
  	let that = this;
	Utils.get(Utils.domain+'app/users/security?tokenId='+global.tokenId,this.success,function(err){
				console.log('账户安全页面出错',err);
		  		// 网络请求超时或断网时 [TypeError: Network request failed]
					if(err.toString().indexOf('Network request failed')!=-1){
						Utils.msg('网络连接超时...');
						that.setState({
							isConnected:false
						});
					}
		});
  }
  // 组件挂载完毕
  componentDidMount(){
  	InteractionManager.runAfterInteractions(() => {
	    // 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
		  if(isConnected || global._platfrom=='ios'){
			// 调用方法请求数据
			this.getData();
		  }else{
			// 当前无网络连接
			this.setState({
			  isConnected:false,
			});
		  }
		});
	});
  }
  _onRefresh(){
	// 检测网络状态
	NetInfo.isConnected.fetch().done((isConnected) => {
		if(isConnected || global._platfrom=='ios'){
		  this.setState({
			isConnected:true,
			loading:false
		  });
		  this.getData();
		}else{
		  // 当前无网络连接
		  this.setState({
			isConnected:false,
		  });
		}
	});
  }
  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'账户安全'}} backEvent={()=>{this.props.navigator.pop()}} />);
  }
  
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	// 请求数据中
	/*if(!this.state.loadData){
		return Utils.loading();
	}*/
	
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
        	{
        		securityData!=undefined
        		?
	         	<View style={styles.list}>
	         		<TouchableOpacity style={styles.secterm} onPress={()=>{this.props.navigator.push({component:PayPass,passProps:{payPwd:securityData.payPwd,_refresh:this._onRefresh}});}}>
	         			<Image source={require('../../img/icon_zhanghuanquan_01.png')} style={styles.secimg}/>
	         			<Text style={styles.secword}>{securityData.payPwd==1?'修改':'设置'}支付密码</Text>
	         			<Icon style={styles.secicon} name={'angle-right'} size={22} color={'#818183'}/>
	         		</TouchableOpacity>
	         		<View style={{borderBottomColor: '#edebeb',borderBottomWidth:0.5}}></View>
	         		<TouchableOpacity style={styles.secterm} onPress={()=>{this.props.navigator.push({component:Phone,passProps:{phoneType:securityData.phoneType,phone:securityData.userPhone}});}}>
		     			<Image source={require('../../img/icon_zhanghuanquan_02.png')} style={styles.secimg}/>
		     			<Text style={styles.secword}>{securityData.phoneType==1?'修改':'绑定'}手机号码</Text>
		     			<Icon style={styles.secicon} name={'angle-right'} size={22} color={'#818183'}/>
		     		</TouchableOpacity>
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
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   list:{
	   marginTop:10,
	   paddingLeft:10,
	   backgroundColor: '#ffffff'
   },
   secterm:{
	   flexDirection: 'row',
	   paddingTop:12,
	   paddingBottom:12
   },
   secimg:{
	   width: 23,
	   height:23
   },
   secicon:{
	   paddingRight:10
   },
   secword:{
	   flex: 1,
	   marginTop:1,
	   marginLeft:5,
	   fontSize:15
   }
});