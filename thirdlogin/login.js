/**
* 第三方登录绑定账号
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
import Header from './../common/header';
// 工具类
import Utils from './../common/utils';
//base64加密
import Base64 from './../common/base64';

let {width,height} = Utils;

export default class Login extends Component {
  constructor(props){
  	super(props);
  	this.state={};
  	// 记录用户输入的信息
  	this.state.userName = '';
  	this.state.passWord = '';
  	this.state.verify = '';

  	// 验证码图片
  	this.state.verifyUri = Utils.domain+'app/users/getVerify?'+Math.random();


  	// 绑定this
  	this.getVerify = this.getVerify.bind(this);
    this.login = this.login.bind(this);
  	this.back = this.back.bind(this);
	
  }
  // 组件挂载完毕
  componentDidMount(){
  	// 获取验证码
  	//this.getVerify();
  }
  // 点击刷新验证码
  getVerify(){
  	this.setState({
  		verifyUri:Utils.domain+'app/users/getVerify?'+Math.random()
  	});
  }
  // 点击登录按钮
  login(){
  	let that = this;
  	let userName = this.state.userName;
  	let passWord = this.state.passWord;
  	let verify = this.state.verify
	if(userName==''){
		Utils.msg('请输入登录名');
		return;
	}
	if(passWord==''){
		Utils.msg('请输入登录密码');
		return;
	}
	if(verify==''){
		Utils.msg('请输入验证码');
		return;
	}
  	// 加密数据
  	let loginKey = Base64.encode(Base64.encode(userName)+'_'+Base64.encode(passWord));
  	let postData={
  		loginKey:loginKey,
  		loginRemark:'android',
  		verifyCode:verify,
      unionId:this.props.unionId?this.props.unionId:'',// 微信
      qqOpenId:this.props.openId?this.props.openId:'',// QQ
      alipayId:this.props.alipayId?this.props.alipayId:'',// 支付宝
  	}
  	Utils.post(Utils.domain+'app/users/login',
  			   postData,
  			   responseData=>{
  			   	// 登录成功之后,保存tokenId,并跳转到用户中心页面
  			   	if(responseData.status==1){
              // 提示信息
              Utils.msg(responseData.msg,1);

              let tokenId = responseData.data.tokenId;
              // 保存tokenId
              global.storage.save({
                key:'tokenId',
                rawData:tokenId,
                expires:null
              });
              // 设置全局变量
              global.isLogin = true;
              global.tokenId = tokenId;
              // 用户id,分享用
              global.shareInfo =  {
                sharerId:Base64.encode(JSON.stringify(responseData.data.userId)),
                userId:responseData.data.userId,
                isSharer:responseData.data.isSharer,
                shareRank:responseData.data.shareRank
              }

              that.props.navigator.popToTop();

  			   	}else{
  			   		// 未成功登录  刷新验证码
  			   		that.getVerify();
  			   		Utils.msg(responseData.msg,1);
  			   	}
  			   },
  			   err=>{
  			   	console.warn('请求失败');
  			   	console.warn(err.message);
  			   	console.warn(err.name);
  			   });

  }

  // 返回上一个页面
  back(){
    this.props.navigator.pop();
  }

  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'登录'}} navigator={this.props.navigator} />);
  }
  
  render() {
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
	         <View style={styles.login}>
	         	<TextInput 
              autoCapitalize={'none'}
              autoCorrect={false}
              value={this.state.userName}
              onChangeText={(val)=>this.setState({userName:val.replace(/\D/g, "")})}
	         		style={styles.logininput} 
	         		underlineColorAndroid={'transparent'} 
	         		placeholder="手机号"/>

	         	<TextInput 
              autoCapitalize={'none'}
              autoCorrect={false}
	         		onChangeText={(val)=>this.setState({passWord:val})}
		         	style={styles.logininput} 
		         	underlineColorAndroid={'transparent'} 
		         	secureTextEntry={true}  
		         	placeholder="密码"/>
	         	<View style={styles.loginver}>
		         	<TextInput 
                autoCapitalize={'none'}
                autoCorrect={false}
		         		onChangeText={(val)=>this.setState({verify:val})}
		         		style={styles.loginverinp} 
		         		underlineColorAndroid={'transparent'} 
		         		placeholder="输入验证码"/>
		         	<TouchableOpacity onPress={this.getVerify}>
		         		<Image source={{uri:this.state.verifyUri}} style={styles.loginverimg} />
		         	</TouchableOpacity>
	         	</View>
	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.login}>
	         		<Text style={styles.button}>登录</Text>
	         	</TouchableOpacity>
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
   row:{flexDirection:'row'},
   head:{
	   flex: 1,
	   height:40,
	   backgroundColor: '#ffffff',
	   borderBottomColor: '#e8e8e8',
	   borderBottomWidth:0.5
   },
   title:{
	   flex: 1,
	   height:40,
	   fontSize: 18,
	   color: '#59595c',
	   textAlign: 'center',
	   lineHeight: 30,
	   alignItems: 'center'
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
	   backgroundColor: '#e00102',
   },
   option:{
	   marginTop: 18,
	   paddingLeft:10,
	   paddingRight:10,
	   flexDirection: 'row',
   },
   register:{
	   color: '#e00102',
   },
   back:{
	   textAlign: 'right',
	   color: '#e00102'
   },
   tlogin_item:{
      flex:1,
      justifyContent:'center',
      alignItems:'center'
   },
   tlogin_img:{
      width:35,
      height:35,
      marginBottom:5
   },
});
