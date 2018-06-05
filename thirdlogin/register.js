/**
* 第三方登录注册账号
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput
} from 'react-native';

//引入公共头部
import Header from '../common/header';
//工具类
import Utils from '../common/utils';
//base64加密
import Base64 from '../common/base64';


var time = 0;
var isSend = false;
export default class Register extends Component {
	constructor(props){
		super(props);
		this._style_ash = {backgroundColor: '#c6c7c6'};
		this._style_blue = {backgroundColor:'#18b4ed'};
        this.state= {
        	regName: '',
        	regPwd:'',
        	regcoPwd:'',
        	regVerfy:'',
        	smsVerfy:'',
        	phoneCode:'',
        	nameType:3,
        	nameCode:'获取验证码',
        	nameStyle:this._style_blue,
        	nameDisabled:false
         }
        
        // 验证码图片
        this.state.verifyUri = Utils.domain+'app/users/getVerify?'+Math.random();
		
        this.getVerify = this.getVerify.bind(this);
		this.register = this.register.bind(this);
		this.sendVerfys = this.sendVerfys.bind(this);
	}
	
  // 点击刷新验证码
  getVerify(){
  	this.setState({
  		verifyUri:Utils.domain+'app/users/getVerify?'+Math.random()
  	});
  }

  //设置
  register(){
		let that = this;
		let regName = this.state.regName;
		let regPwd  = this.state.regPwd;
		let regcoPwd = this.state.regcoPwd;
		let regVerfy = this.state.regVerfy;
		let phoneCode = this.state.phoneCode;
		let nameType = this.state.nameType;
		if(regName==''){
			Utils.msg('请输入登录名');
			return;
		}
		if(regPwd==''){
			Utils.msg('请输入密码');
			return;
		}
		if(regPwd.length<6){
			Utils.msg('请输入6位以上数字或者字母的密码');
			return;
		}
		if(regcoPwd==''){
			Utils.msg('请输入确认密码');
			return;
		}
		if(regPwd!=regcoPwd){
			Utils.msg('确认密码不一致');
			return;
		}
		if(nameType==3){
			if(phoneCode==''){
				Utils.msg('请输入短信验证码');
				return;
			}
		}else{
			if(regVerfy==''){
				Utils.msg('请输入验证码');
				return;
			}
		}
	  	// 加密数据
	  	let registerKey = Base64.encode(Base64.encode(regName)+'_'+Base64.encode(regPwd));
		// 请求接口
		Utils.post(Utils.domain+'app/users/register',
			{registerKey:registerKey,
			 verifyCode:regVerfy,
			 mobileCode:phoneCode,
			 nameType:nameType,
			 loginRemark:'android',
			 unionId:this.props.unionId?this.props.unionId:'',// 微信
      		 qqOpenId:this.props.openId?this.props.openId:'',// QQ
      		 alipayId:this.props.alipayId?this.props.alipayId:'',// 支付宝
			},
			function(responData){
				if(responData.status==1){
					  isSend = true;
					  Utils.msg(responData.msg);
		              let tokenId = responData.data.tokenId;
		              // 保存tokenId
		              global.storage.save({
		                key:'tokenId',
		                rawData:tokenId,
		                expires:null
		              });
		              // 设置全局变量
		              global.isLogin = true;
		              global.tokenId = tokenId;
					// 重新请求数据渲染页面
					that.props.navigator.popToTop();
				}else{
					Utils.msg(responData.msg);
					that.getVerify();
				}
			},
			function(err){
				Utils.msg('注册失败');
			});
  }
  //检测
  testingName(val){
	  this.setState({regName:val.replace(/\D/g, "")});
	  let regMobile = /^1[\d]{10}$/;
	  if(regMobile.test(val)){//手机
		  this.setState({nameType:3});
	  }
  }
  //获取手机验证码
  sendVerfys(){
	  that = this
	  time = 120;
	  let regName = this.state.regName;
	  let smsVerfy = this.state.smsVerfy;
		if(regName==''){
			Utils.msg('请输入手机号');
			return;
		}
	  if(smsVerfy=='' && global.confInfo.smsVerfy==1){
		  Utils.msg('请输入验证码');
		  return;
	  }
		// 请求接口
		Utils.post(Utils.domain+'app/users/getphonecode',
			{userPhone:regName,smsVerfy:smsVerfy},
			function(responData){
				if(responData.status==1){
					Utils.msg('发送成功');
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
					Utils.msg(responData.msg);
					that.getVerify();
				}
			},
			function(err){
				console.log('注册页面获取验证码失败',err);
				Utils.msg('发送失败');
			});
  }
  
  //开启手机验证
  smsVerfys(){
	  if(global.confInfo.smsVerfy==1){
		  let lists = <View style={styles.loginver}>
					       	<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.loginverinp} underlineColorAndroid={'transparent'} placeholder="验证码" onChangeText={(val)=>this.setState({smsVerfy:val})}/>
					     	<TouchableOpacity onPress={this.getVerify}>
					     		<Image source={{uri:this.state.verifyUri}} style={styles.loginverimg}/>
					     	</TouchableOpacity>
					 	</View>;
		  return  lists;
	  }
  }
  
  changeVerfy(type){
	  var cha = [];
	  if(type==3){
		  let list = <View key={0}>
		  				{this.smsVerfys()}
						<View style={styles.loginver}>
							<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.loginverinp} underlineColorAndroid={'transparent'} placeholder="短信验证码" onChangeText={(val)=>this.setState({phoneCode:val})}/>
							<TouchableOpacity disabled={this.state.nameDisabled} onPress={this.sendVerfys}>
								<Text style={[styles.phoneCode,this.state.nameStyle]}>{this.state.nameCode}</Text>
							</TouchableOpacity>
						</View>
					 </View>;
		  cha.push(list);
	  }else{
		  let list = <View key={1} style={styles.loginver}>
				       	<TextInput autoCapitalize={'none'} autoCorrect={false} style={styles.loginverinp} underlineColorAndroid={'transparent'} placeholder="验证码" onChangeText={(val)=>this.setState({regVerfy:val})}/>
				     	<TouchableOpacity onPress={this.getVerify}>
				     		<Image source={{uri:this.state.verifyUri}} style={styles.loginverimg}/>
				     	</TouchableOpacity>
				 	</View>;
		   cha.push(list);
	  }
	  
	  return cha;
  }
  
  //返回
  toReturn(){
	  isSend = true;
	  this.props.navigator.pop();
  }
	  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'注册'}} backEvent={()=>this.toReturn()} />);
  }
		
  render() {
    return (
    	<View  style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
	         <View style={styles.login}>
	         	<TextInput 
	         		autoCapitalize={'none'} 
	         		autoCorrect={false} 
	         		style={styles.logininput} 
	         		underlineColorAndroid={'transparent'} 
	         		placeholder="请输入手机号码" 
	         		value={this.state.regName}
	         		onChangeText={(val)=>{this.testingName(val)}}/>
	         	<TextInput 
	         		autoCapitalize={'none'} 
	         		autoCorrect={false} 
	         		style={styles.logininput} 
	         		underlineColorAndroid={'transparent'} 
	         		secureTextEntry={true}  
	         		placeholder="密码" onChangeText={(val)=>this.setState({regPwd:val})}/>
	         	<TextInput 
	         		autoCapitalize={'none'} 
	         		autoCorrect={false} 
	         		style={styles.logininput} 
	         		underlineColorAndroid={'transparent'} 
	         		secureTextEntry={true}  
	         		placeholder="确认密码" onChangeText={(val)=>this.setState({regcoPwd:val})}/>
	         	{this.changeVerfy(this.state.nameType)}
	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.register}><Text style={styles.button}>注册</Text></TouchableOpacity>
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