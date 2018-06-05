/**
* 找回支付密码
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
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';

//账户安全
import Security from './security';
//手机号码
import Phones from './phone';
// 重置支付密码页
import ResetPayPwd from './reset_pay_pwd';

var time = 0;
var isSend = false;
var _style_ash = {backgroundColor: '#c6c7c6'};
var _style_blue = {backgroundColor:'#18b4ed'};

export default class FindPayPwd extends Component {
	constructor(props){
		super(props);
        this.state= {
        	userPhone:'',
        	smsVerfy:'',
        	phoneCode:'',
        	nameCode:'获取验证码',
        	nameStyle:_style_blue,
        	nameDisabled:false,
        	phone:'',
        	loading:true,
        }
        phoneType = this.props.phoneType;
        // 验证码图片
        this.state.verifyUri = Utils.domain+'app/users/getVerify?'+Math.random();
        
        this.getVerify = this.getVerify.bind(this);
        this.sendVerfys = this.sendVerfys.bind(this);
        this.determine = this.determine.bind(this);
	}
  getData(){
  	let that = this;
  	let url = Utils.domain+'app/users/backPayPass';
  	let postData = {
  		tokenId:global.tokenId,
  	}
  	Utils.post(
  			  url,
  			  postData,
  			  (responData)=>{
  			  		if(responData.status==1){
  			  			let _data = responData.data;
  			  			let phone = _data.phoneType==1?_data.userPhone:false;// 是否有绑定手机
  			  			that.setState({
  			  				phone:phone,
  			  				loading:false,
  			  			});
  			  		}
  			  },
  			  (err)=>{
  			  		console.log('找回支付密码报错',err);
  			  });
  }
  componentDidMount(){
  	this.getData();
  }


  // 点击刷新验证码
  getVerify(){
  	this.setState({
  		verifyUri:Utils.domain+'app/users/getVerify?'+Math.random()
  	});
  }

  //下一步
  determine(){
		let that = this;
		let phoneCode  = this.state.phoneCode;
		if(global.confInfo.smsOpen==1 && phoneCode==''){
			Utils.msg('请输入短信验证码');
			return;
		}
		// 请求接口
		Utils.post(Utils.domain+'app/users/verifybackPay',
			{tokenId:global.tokenId,phoneCode:phoneCode},
			function(responData){
				if(responData.status==1){
					isSend = true;
					Utils.msg(responData.msg);
					// 验证成功,进入重置支付密码页面
					that.props.navigator.replace({component:ResetPayPwd});
				}else{
					Utils.msg(responData.msg);
				}
			},
			function(err){
				Utils.msg('操作失败');
			});
  }
  
  //获取手机验证码
  sendVerfys(){
	  let that = this
	  time = 120;
	  let smsVerfy = this.state.smsVerfy;
	  if(smsVerfy=='' && global.confInfo.smsVerfy==1){
		  Utils.msg('请输入验证码');
		  return;
	  }
		// 请求接口
		Utils.post(Utils.domain+'app/users/backpayCode',
			{tokenId:global.tokenId,smsVerfy:smsVerfy},
			function(responData){
				if(responData.status==1){
					Utils.msg('发送成功','top');
				    that.setState({nameCode:'120秒后重试',nameStyle:_style_ash,nameDisabled:true});
					var task = setInterval(function(){
						time--;
						that.setState({nameCode:time+'秒后重试'});
						if(time==0 || time<0 || isSend){
							isSend = false;
							clearInterval(task);
							that.setState({nameCode:'重新发送',nameStyle:_style_blue,nameDisabled:false});
							return;
						}
					},1000);
				}else{
					Utils.msg(responData.msg,'top');
					that.getVerify();
				}
			},
			function(err){
				console.log('验证码发送失败',err);
				Utils.msg('发送失败','top');
			});
  }
  //返回
  toReturn(){
	  isSend = true;
	  this.props.navigator.pop();
  }
  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title: '找回支付密码'}} backEvent={()=>this.toReturn()} />);
  }
  
  //原密码
  primary(){
	  let pri = [];
	  let i = 0;
	  if(phoneType==0){
		  pri.push(<TextInput keyboardType={'numeric'} key={i} style={styles.logininput} underlineColorAndroid={'transparent'} placeholder="手机号码" onChangeText={(val)=>this.setState({userPhone:val})}/>);
	  }else{
		  pri.push(<Text key={i} style={styles.logintext}>您绑定的手机号码为：{this.state.phone}</Text>);
	  }
	  return pri;
  }
  render() {
  	if(this.state.loading){
  		return Utils.loading();
  	}
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        
        	 {
        	 	this.state.phone
        	 	?
        	 	<ScrollView>
			         <View style={styles.login}>
			         	{this.primary()}
			         	{
			         		global.confInfo.smsVerfy==1
			         		?
				         	<View style={styles.loginver}>
					         	<TextInput style={styles.loginverinp} underlineColorAndroid={'transparent'} placeholder="输入验证码" onChangeText={(val)=>this.setState({smsVerfy:val})}/>
					         	<TouchableOpacity onPress={this.getVerify}>
					         	<Image source={{uri:this.state.verifyUri}} style={styles.loginverimg}/>
					         	</TouchableOpacity>
				         	</View>
			         		:
			         		null
			         	}
			         	{
			         		global.confInfo.smsOpen==1
			         		?
							<View style={styles.loginver}>
								<TextInput style={styles.loginverinp} underlineColorAndroid={'transparent'} placeholder="短信验证码" onChangeText={(val)=>this.setState({phoneCode:val})}/>
								<TouchableOpacity disabled={this.state.nameDisabled} onPress={this.sendVerfys}>
									<Text style={[styles.phoneCode,this.state.nameStyle]}>{this.state.nameCode}</Text>
								</TouchableOpacity>
							</View>
							:
							null
						}
			         </View>
			         <View style={styles.tologin}>
			         	<TouchableOpacity onPress={this.determine}><Text style={styles.button}>下一步</Text></TouchableOpacity>
			         </View>
		         </ScrollView>
        	 	:
        	 	<View>
	        	 	<View style={[styles.login,styles.bind_phone]}>
			         	<Text>
			         		对不起,你还未绑定手机号码,请先绑定手机号码。
			         	</Text>
			         </View>
			         <View style={styles.tologin}>
			         	<TouchableOpacity onPress={()=>this.props.navigator.replace({
			         		component:Phones,
			         		passProps:{
			         			phoneType:0
			         		}
			         	})}>
			         		<Text style={styles.button}>去绑定手机号码</Text>
			         	</TouchableOpacity>
			         </View>
			    </View>
        	 }

	    
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
   logintext:{
	   fontSize: 15,
	   paddingTop:16,
	   paddingBottom:12
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
	   backgroundColor: '#e00102',
   },
   phoneCode:{
	   width: 150,
	   color: '#ffffff',
	   textAlign: 'center',
	   borderRadius: 3,
	   height:41,
	   fontSize: 15,
	   lineHeight: 30
   },
   bind_phone:{
   	backgroundColor:'#f6f6f8',
   	justifyContent:'center',
   	alignItems:'center',
   	height:'80%',
   }
});