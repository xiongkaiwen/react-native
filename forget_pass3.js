/**
* 找回密码3
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  NetInfo
} from 'react-native';

//引入公共头部
import Header from './common/header';
//工具类
import Utils from './common/utils';
//显示刷新页面
import Refresh from './common/refresh';
//找回密码
import ForgetPassLast from './forget_pass4';
const time = 0;
const isSend = false;

export default class ForgetPassThree extends Component {
	constructor(props){
		super(props);
		this.backType = null;
		this.usresData = null;
		this._style_ash = {backgroundColor: '#c6c7c6'};
		this._style_blue = {backgroundColor:'#18b4ed'};

        this.state= {
        	verifyCode: '',
        	obtainCode:'',
        	nameCode:'获取验证码',
        	nameStyle:this._style_blue,
        	nameDisabled:false
         }
        this.backType = this.props.type;
        
        // 是否有网络
		this.state.isConnected = true;
		// 是否加载数据
		this.state.loading = true;
        
        // 验证码图片
        this.state.verifyUri = Utils.domain+'app/users/getVerify?'+Math.random();
		
		this.success = this.success.bind(this);
        this.getVerify = this.getVerify.bind(this);
        this.sendVerfys = this.sendVerfys.bind(this);
		this.topStep = this.topStep.bind(this);
	}
	
  //点击刷新验证码
  getVerify(){
  	this.setState({
  		verifyUri:Utils.domain+'app/users/getVerify?'+Math.random()
  	});
  }
  
  
	//请求成功的回调方法
	success(data){
	this.usresData = data.data;
	if(this.usresData){
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
				console.log('forget_pass3',err);
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
  topStep(){
		let that = this;
		let obtainCode = this.state.obtainCode;
		if(global.confInfo.smsOpen==1 && obtainCode==''){
			Utils.msg('请输入效验码');
			return;
		}
		// 请求接口
		Utils.post(Utils.domain+'app/users/findPass',
			{Checkcode:obtainCode,modes:this.backType,step:2,},
			function(responData){
				if(responData.status==1){
					  isSend = true;
					  Utils.msg('验证成功');
					  that.props.navigator.replace({component:ForgetPassLast});
				}else{
					Utils.msg(responData.msg);
					that.getVerify();
				}
			},
			function(err){
				Utils.msg('验证失败');
			});
  }
  
  //获取手机验证码
  sendVerfys(){
	  that = this
	  time = 120;
	  let verifyCode = this.state.verifyCode;
	  if(global.confInfo.smsVerfy==1 && verifyCode==''){
		  Utils.msg('请输入验证码');
		  return;
	  }
		if(this.backType==1){
			url = 'getfindPhone';
		}else{
			url = 'getfindEmail';
		}
		// 请求接口
		Utils.post(Utils.domain+'app/users/'+url,
			{smsVerfy:verifyCode},
			function(responData){
				if(responData.status==1){
					Utils.msg('发送成功','center');
				    that.setState({nameCode:'120秒后重试',nameStyle:that._style_ash,nameDisabled:true});
					var task = setInterval(function(){
						time--;
						that.setState({nameCode:time+'秒后重试'});
						if(time==0 || time<0 || isSend){
							isSend = false;
							clearInterval(task);
							that.setState({nameCode:'重新发送',nameStyle:that._style_blue,nameDisabled:false});
						}
					},1000);
				}else{
					Utils.msg(responData.msg,'center');
					that.getVerify();
				}
			},
			function(err){
				Utils.msg('发送失败','center');
			});
  }

  //返回
  toReturn(){
	  isSend = true;
	  this.props.navigator.pop();
  }
	  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'忘记密码'}} backEvent={()=>this.toReturn()} />);
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
	         <View style={styles.login}>
	            <View style={styles.info}><Text>用户名：{this.usresData.loginName}</Text></View>
	            <View style={styles.info}><Text>{this.backType==1?'手机号码：'+this.usresData.userPhone:'邮箱：'+this.usresData.userEmail}</Text></View>
		         <View style={styles.loginver}>
			       	<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.loginverinp} underlineColorAndroid={'transparent'} placeholder="验证码" onChangeText={(val)=>this.setState({verifyCode:val})} />
			     	<TouchableOpacity onPress={this.getVerify}>
			     		<Image source={{uri:this.state.verifyUri}} style={styles.loginverimg}/>
			     	</TouchableOpacity>
			 	</View>
			 	{
			 		global.confInfo.smsOpen==1
			 		?
					<View style={styles.loginver}>
						<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.loginverinp} underlineColorAndroid={'transparent'} placeholder="效验码" onChangeText={(val)=>this.setState({obtainCode:val})}/>
						<TouchableOpacity disabled={this.state.nameDisabled} onPress={this.sendVerfys}>
							<Text style={[styles.phoneCode,this.state.nameStyle]}>{this.state.nameCode}</Text>
						</TouchableOpacity>
					</View>
			 		:
			 		null
			 	}

	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.topStep}><Text style={styles.button}>下一步</Text></TouchableOpacity>
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
   login:{
	   marginTop: 10,
	   backgroundColor: '#ffffff',
	   padding:10,
	   paddingBottom:0
   },
   info:{
	   paddingTop:10,
	   paddingBottom:15
   },
   logininput:{
	   height:42,
	   borderColor: '#a0a0a0',
	   borderWidth:1,
	   marginBottom: 10,
	   borderRadius: 2
   },
   loginver:{
	   height:42,
	   borderColor: '#a0a0a0',
	   borderWidth:1,
	   marginBottom: 10,
	   borderRadius: 2,
	   flexDirection: 'row'
   },
   loginverinp:{
	   flex: 1,
   },
   loginverimg:{
	   width: 150,
	   height:40
   },
   tologin:{
	   marginTop: 35,
	   paddingLeft:10,
	   paddingRight:10
   },
   button:{
	   color: '#ffffff',
	   textAlign: 'center',
	   borderRadius: 3,
	   height:41,
	   fontSize: 15,
	   lineHeight: 30,
	   backgroundColor: '#e00102'
   },
   phoneCode:{
	   width: 150,
	   color: '#ffffff',
	   textAlign: 'center',
	   borderRadius: 3,
	   height:41,
	   fontSize: 15,
	   lineHeight: 30
   }
});