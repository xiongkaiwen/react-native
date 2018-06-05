/**
* 找回密码2
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  NetInfo
} from 'react-native';

//引入公共头部
import Header from './common/header';
//工具类
import Utils from './common/utils';
//显示刷新页面
import Refresh from './common/refresh';
//找回密码
import ForgetPassThree from './forget_pass3';


export default class ForgetPassTwo extends Component {
	constructor(props){
		super(props);
		this.usreData = undefined;
        this.state= {};
        
        // 是否有网络
		this.state.isConnected = true;
		// 是否加载数据
		this.state.loading = true;
        
		this.success = this.success.bind(this);
		this.topStep = this.topStep.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	this.usreData = data.data;
	if(this.usreData){
		this.setState({
			loading:false
		  });
		}
	}
	
 // 获取数据
  getData(){
	//获取信息
	  	let that = this;
		Utils.get(Utils.domain+'app/users/forgetPasst',this.success,function(err){
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
  }
  _onRefresh(){
	// 检测网络状态
	NetInfo.isConnected.fetch().done((isConnected) => {
		if(isConnected || global._platfrom=='ios'){
		  this.setState({
			isConnected:true,
			loading:true
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
	  
  //下一步
  topStep(type){
	    if(type==1 && this.usreData.userPhone){
	    	this.props.navigator.push({component:ForgetPassThree,passProps:{type:type}});    	
	    }else if(type==2 && this.usreData.userEmail){
	    	this.props.navigator.push({component:ForgetPassThree,passProps:{type:type}});
	    }
  }
	  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'找回方式'}} backEvent={()=>this.props.navigator.pop()} />);
  }
		
  render() {
  	if(!this.state.isConnected){
        return <Refresh refresh={this._onRefresh} /> ;
  	}
  	// 请求数据中
  	if(this.state.loading){
  		return Utils.loading();
  	}
    return (
    	<View  style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
	         <View style={styles.forget}>
	         	<Text style={styles.option} onPress={()=>this.topStep(1)}>{this.usreData.userPhone?'通过手机找回':'没有预留手机号码，请尝试用邮箱找回'}</Text>
	         	<View style={styles.line}/>
	         	<Text style={styles.option} onPress={()=>this.topStep(2)}>{this.usreData.userEmail?'通过邮箱找回':'没有预留邮箱，请尝试用手机号码找回'}</Text>
	         </View>
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
   forget:{
	   marginTop: 10,
	   backgroundColor: '#ffffff',
	   paddingLeft:10,
	   paddingRight:10
   },
   option:{
	   paddingTop:15,
	   paddingBottom:15
   },
   line:{
	   borderColor: '#cccccc',
	   borderWidth:0.5,
   }
});