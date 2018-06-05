/**
* 手机号码
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

var time = 0;
var isSend = false;
var _style_ash = {backgroundColor: '#c6c7c6'};
var _style_blue = {backgroundColor:'#18b4ed'};

export default class Phone extends Component {
	constructor(props){
		super(props);
        this.state= {
        	userPhone:'',
        	smsVerfy:'',
        	phoneCode:'',
        	nameCode:'获取验证码',
        	nameStyle:_style_blue,
        	nameDisabled:false
        }
        phoneType = this.props.phoneType;
        // 验证码图片
        this.state.verifyUri = Utils.domain+'app/users/getVerify?'+Math.random();
        
        this.getVerify = this.getVerify.bind(this);
        this.sendVerfys = this.sendVerfys.bind(this);
        this.determine = this.determine.bind(this);
	}
	
  // 点击刷新验证码
  getVerify(){
  	this.setState({
  		verifyUri:Utils.domain+'app/users/getVerify?'+Math.random()
  	});
  }

  //确定
  determine(){
		let that = this;
		let userPhone = this.state.userPhone;
		let phoneCode  = this.state.phoneCode;
		if(phoneType==0){
			if(userPhone==''){
				Utils.msg('请输入手机号码');
				return;
			}
		}
		if(global.confInfo.smsOpen==1 && phoneCode==''){
			Utils.msg('请输入短信验证码');
			return;
		}
		if(phoneType==0){
			url = 'phoneEdit';
		}else{
			url = 'phoneEdito';
		}
		// 请求接口
		Utils.post(Utils.domain+'app/users/'+url,
			{tokenId:global.tokenId,phoneCode:phoneCode},
			function(responData){
				if(responData.status==1){
					isSend = true;
					Utils.msg(responData.msg);
					// 重新请求数据渲染页面
					if(phoneType==0){
						that.props.navigator.replace({component:Security});
					}else{
						that.props.navigator.replace({component:Phones,passProps:{phoneType:0}});
					}
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
	  that = this
	  time = 120;
	  let userPhone = this.state.userPhone;
	  let smsVerfy = this.state.smsVerfy;
		if(userPhone=='' && phoneType==0){
			Utils.msg('请输入手机号');
			return;
		}
	  if(smsVerfy=='' && global.confInfo.smsVerfy==1){
		  Utils.msg('请输入验证码');
		  return;
	  }
		if(phoneType==0){
			url = 'sendCodeTie';
		}else{
			url = 'sendCodeEdit';
		}
		// 请求接口
		Utils.post(Utils.domain+'app/users/'+url,
			{tokenId:global.tokenId,userPhone:userPhone,smsVerfy:smsVerfy},
			function(responData){
				if(responData.status==1){
					Utils.msg('发送成功');
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
					Utils.msg(responData.msg);
					that.getVerify();
				}
			},
			function(err){
				Utils.msg('发送失败');
			});
  }
  //返回
  toReturn(){
	  isSend = true;
	  this.props.navigator.pop();
  }
  
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title: phoneType==1?'修改手机号码':'绑定手机号码'}} backEvent={()=>this.toReturn()} />);
  }
  
  //原密码
  primary(){
	  let pri = [];
	  let i = 0;
	  if(phoneType==0){
		  pri.push(<TextInput keyboardType={'numeric'} key={i} style={styles.logininput} underlineColorAndroid={'transparent'} placeholder="手机号码" onChangeText={(val)=>this.setState({userPhone:val})}/>);
	  }else{
		  pri.push(<Text key={i} style={styles.logintext}>您绑定的手机号码为：{this.props.phone}</Text>);
	  }
	  return pri;
  }
  
  render() {
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
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
	         	<TouchableOpacity onPress={this.determine}><Text style={styles.button}>确定</Text></TouchableOpacity>
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
   }
});