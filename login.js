/**
* 登录
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
  Dimensions,
  StatusBar
} from 'react-native';
// 工具类
import Utils from './common/utils';
//base64加密
import Base64 from './common/base64';
//注册
import Register from './register';
//找回密码
import ForgetPassOne from './forget_pass';
// requesting
import Requesting from './common/requesting';
/* 微信登录 */
import * as WeChat from 'react-native-wechat';
import WxBind from './thirdlogin/wx_bind';
/* qq登录 */
import * as QQAPI from 'react-native-qq';
import QqBind from './thirdlogin/qq_bind';
/* 支付宝登录 */
import Alipay from 'react-native-yunpeng-alipay';
import AlipayBind from './thirdlogin/alipay_bind';
let not4s_style={paddingTop:10};
if(Dimensions.get('window').height>480)not4s_style= {position:'absolute',bottom:60};

let {width,height} = Utils;
export default class Login extends Component {
  constructor(props){
  	super(props);
    this.renderWechatLogin();
  	this.state={};
  	// 记录用户输入的信息
  	this.state.userName = '';
  	this.state.passWord = '';
  	// 验证码图片
  	// 绑定this
    this.login = this.login.bind(this);
  	this.back = this.back.bind(this);
    this.showUploading = this.showUploading.bind(this);
    this.checkQqLogin = this.checkQqLogin.bind(this);
    this.checkAlipayLogin = this.checkAlipayLogin.bind(this);
	
  }
  // 组件挂载完毕
  componentDidMount(){
  }
  // 点击登录按钮
  login(){
  	let that = this;
  	let userName = this.state.userName;
  	let passWord = this.state.passWord;
	if(userName==''){
		Utils.msg('请输入登录名');
		return;
	}
	if(passWord==''){
		Utils.msg('请输入登录密码');
		return;
	}
  	// 加密数据
  	let loginKey = Base64.encode(Base64.encode(userName)+'_'+Base64.encode(passWord));
  	let postData={
  		loginKey:loginKey,
  		loginRemark:'android',
  	}
  	Utils.post(Utils.domain+'app/users/login',
  			   postData,
  			   (responseData)=>{
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
              that.props.navigator.pop();
  			   	}else{
  			   		Utils.msg(responseData.msg,1);
  			   	}
  			   },
  			   (err)=>{
            Utils.msg('登录失败,请重试');
  			   	console.log('登录出错',err);
  			   });

  }

  /**************************************************************** 微信登录 ****************************************************************/
  // 微信登录
  wxLogin(){
    // 执行授权
    let scope = 'snsapi_userinfo';
    let state = 'wechat_sdk_demo';


    // 请求中。。
    this.showUploading(true);

    //判断微信是否安装
    WeChat.isWXAppInstalled()
      .then((isInstalled) => {
        if (isInstalled) {
          //发送授权请求
          WeChat.sendAuthRequest(scope, state)
            .then(responseCode => {
              // 关闭请求中
              this.showUploading(false);
              //返回code码，通过code获取access_token
              this.getAccessToken(responseCode.code);
            })
            .catch(err => {
               // 关闭请求中
              this.showUploading(false);
              this.userCancel(err);
            })
        } else {
          // 关闭请求中
          this.showUploading(false);
          Utils.msg('未安装微信');
        }
      }).catch(err=>{
        // 关闭请求中
        this.showUploading(false);
        Utils.msg('授权失败,请重试','top');
      })
  }
  getAccessToken(code){
    let url = Utils.domain+'app/thirdlogin/wechatLogin?code='+code;
    Utils.get(
              url,
              (responData)=>{
                if(responData.status==1){
                  // 授权成功,并且已经存在账号,直接操作正常登录步骤
                  // 提示信息
                  Utils.msg('登录成功',1);
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
                  // 用户id,分享用
                  global.shareInfo =  {
                    sharerId:Base64.encode(JSON.stringify(responData.data.userId)),
                    userId:responData.data.userId,
                    isSharer:responData.data.isSharer,
                    shareRank:responData.data.shareRank
                  }

                  this.props.navigator.pop();


                }else if(responData.status==2){
                  // 授权成功,返回unionId,进入账号绑定页面
                   this.props.navigator.push({
                      component:WxBind,
                      passProps:{
                        unionId:responData.data.unionId,// 传递unionId
                        userInfo:responData.data,
                      }
                    })
                }else{
                  // 授权失败
                  Utils.msg(responData.msg);
                  return;
                }

              },
              (err)=>{
                Utils.msg('发生未知错误，请重试');
                console.log('微信授权登录时报错',err)
              });
  }
  userCancel(){
    Utils.msg('取消授权');
  }
  // 显示/隐藏请求中...
  showUploading(flag){
    this.refs.requesting.setState({requesting:flag});
  }
  /**************************************************************** qq登录 ****************************************************************/
  qqLogin(){
    let that = this;
    QQAPI.login('get_user_info').then((data)=>{
      that.checkQqLogin(data);
    }).catch((err)=>{
      Utils.msg('qq授权错误');

    });
  }
  checkQqLogin(authRespon){
    let url = Utils.domain+'app/thirdlogin/qqLogin';
    Utils.post(
              url,
              authRespon,
              (responData)=>{
                if(responData.status==1){
                  // 授权成功,并且已经存在账号,直接操作正常登录步骤

                  // 提示信息
                  Utils.msg('登录成功',1);

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
                  // 用户id,分享用
                  global.shareInfo =  {
                    sharerId:Base64.encode(JSON.stringify(responData.data.userId)),
                    userId:responData.data.userId,
                    isSharer:responData.data.isSharer,
                    shareRank:responData.data.shareRank
                  }

                  this.props.navigator.pop();


                }else if(responData.status==2){
                  // 授权成功,返回unionId,进入账号绑定页面
                   this.props.navigator.push({
                      component:QqBind,
                      passProps:{
                        openId:responData.data.openId,// 传递openId
                        userInfo:responData.data,
                      }
                    })
                }else{
                  // 授权失败
                  Utils.msg(responData.msg);
                  return;
                }
              },
              (err)=>{
                Utils.msg('发生未知错误，请重试');
                console.log('qq授权登录时报错',err)
              })
  }
  /**************************************************************** 支付宝登录 ****************************************************************/
  alipayLogin(){
    let that = this;
    let url = Utils.domain+'app/thirdlogin/alipayAuth';
    Utils.orderPay(
                  url,
                  (authInfo)=>{
                    Alipay.login(authInfo).then((responData)=>{ 
                      let _obj = {};
                      //'resultStatus={9000};memo={};result={success=true&auth_code=a25ab7cb40b84311afe7f6ec752cSX95&result_code=200&alipay_open_id=20881041866370410770478693111695&user_id=2088512772848954}'
                      if(global._platfrom=='ios'){
                        _obj.result = responData[0].result;
                      }else{
                        let _data = responData.split(';');
                        _obj.resultStatus = that._getValue(_data[0],'resultStatus');
                        _obj.memo = that._getValue(_data[1],'memo');
                        _obj.result = that._getValue(_data[2],'result');  
                      }
                      that.checkAlipayLogin(_obj);
                    }, (err)=> {
                        console.log('登录出错',err);
                    });
                  },
                  (err)=>{
                    console.log('err',err);
                  })
  }
  _getValue(content, key) {
        let prefix = key + "={";
        return content.substring(content.indexOf(prefix) + prefix.length,
          content.lastIndexOf("}"));
  }
  checkAlipayLogin(authRespon){
    let authArr = authRespon.result.split('&');
    let _useArr = {};
    for(let i in authArr){
      let _obj = authArr[i].split('=');
      _useArr[_obj[0]] = _obj[1];
    }
    let authCode = _useArr.auth_code;
    let alipayId  = _useArr.user_id;
    let postData = {
      auth_code:authCode,
      alipayId:alipayId
    }
    let url = Utils.domain+'app/thirdlogin/alipayLogin';
    Utils.post(
              url,
              postData,
              (responData)=>{
                if(responData.status==1){
                  // 授权成功,并且已经存在账号,直接操作正常登录步骤
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
                  // 用户id,分享用
                  global.shareInfo =  {
                    sharerId:Base64.encode(JSON.stringify(responData.data.userId)),
                    userId:responData.data.userId,
                    isSharer:responData.data.isSharer,
                    shareRank:responData.data.shareRank
                  }
                  this.props.navigator.pop();
                }else if(responData.status==2){
                  // 授权成功,返回unionId,进入账号绑定页面
                   this.props.navigator.push({
                      component:AlipayBind,
                      passProps:{
                        alipayId:responData.data.user_id,// 传递alipayId
                        userInfo:responData.data,
                      }
                    })
                }else{
                  // 授权失败
                  Utils.msg(responData.msg);
                  return;
                }
              },
              (err)=>{
                Utils.msg('发生未知错误，请重试');
                console.log('支付宝授权登录时报错',err)
              })
  }
  async renderWechatLogin(){
    this.setState({_isInstallWechat:await WeChat.isWXAppInstalled()});
  }
  // 返回上一个页面
  back(){
    this.props.navigator.pop();
  }
  render() {
    return (
    	<View style={styles.container}>
        <StatusBar backgroundColor='black' animated={true} Style="light-content" />
        <View style={styles.backbox}>
          <TouchableOpacity 
            onPress={()=>this.props.navigator.pop()}
            style={styles.back_icon}>
            <Image source={require('./img/nav_btn_back.png')} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={{height:Utils.height-50,position:'relative'}}>
           <View style={styles.login_bg}>
            <Image source={require('./img/login_bg.png')} style={styles.lgimg} />
           </View>
	         <View style={styles.login}>
	         	<TextInput 
              autoCapitalize={'none'}
              autoCorrect={false}
              value={this.state.userName}
	         		onChangeText={(val)=>this.setState({userName:val.replace(/\D/g, "")})}
	         		style={styles.logininput} 
	         		underlineColorAndroid={'transparent'} 
              placeholderTextColor={'#666'}
	         		placeholder="手机号"/>

	         	<TextInput 
              autoCapitalize={'none'}
              autoCorrect={false}
	         		onChangeText={(val)=>this.setState({passWord:val})}
		         	style={styles.logininput} 
		         	underlineColorAndroid={'transparent'} 
		         	secureTextEntry={true}  
              placeholderTextColor={'#666'}
		         	placeholder="密码"/>
	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.login}>
	         		<Text style={styles.button}>登录</Text>
	         	</TouchableOpacity>
	         </View>
	         <View style={styles.option}>
		         <View style={{flex: 1}}><TouchableOpacity onPress={()=>{this.props.navigator.push({component:Register});}}>
		         	<Text style={styles.register}>注册新账号</Text>
		         </TouchableOpacity></View>
		         <View style={{flex: 1}}><TouchableOpacity onPress={()=>{this.props.navigator.push({component:ForgetPassOne});}}>
		         	<Text style={styles.back}>忘记密码</Text>
		         </TouchableOpacity></View>
	         </View>
           {/* 授权中.. */}
           <Requesting ref="requesting" msg={'请稍等...'} />
          <View 
            style={[styles.row,styles.three_loginbox,not4s_style]}>
              <TouchableOpacity style={[styles.tlogin_item]} onPress={()=>this.qqLogin()}>
                <Image source={require('./img/btn_qq.png')} style={styles.tlogin_img} />
                <Text>QQ登录</Text>
              </TouchableOpacity>
              {
                this.state._isInstallWechat
                ?
                <TouchableOpacity style={[styles.tlogin_item]} onPress={()=>this.wxLogin()}>
                  <Image source={require('./img/btn_wechat.png')} style={styles.tlogin_img} />
                  <Text>微信登录</Text>
                </TouchableOpacity>
                :
                null
              }

              <TouchableOpacity style={[styles.tlogin_item]} onPress={()=>this.alipayLogin()}>
                <Image source={require('./img/btn_alipay.png')} style={[styles.tlogin_img,{borderRadius:35*0.5}]} />
                <Text>支付宝登录</Text>
              </TouchableOpacity>
           </View>
      </ScrollView>
	    </View>
    );
  }
}
const styles = StyleSheet.create({
   container: {
	   width:'100%',
     height:'100%',
	   backgroundColor: '#eee',
   },
   backbox:{
      width:'100%',
   },
   back_icon:{
    paddingLeft:30,
    paddingTop:10,
   },
   flex_1:{flex:1},
   row:{flexDirection:'row'},
   login_bg:{
      justifyContent:'center',
      alignItems:'center',
   },
   lgimg:{
      width:width*0.3,
      height:width*0.3*0.7517,
      marginTop:height*0.05,
   },
   login:{
	   marginTop: 10,
	   padding:30,
	   paddingBottom:0
   },
   logininput:{
	   height:45,
	   borderColor: '#4d4d4d',
	   borderWidth:1,
	   marginBottom: 10,
     textAlign:'center',
   },
   tologin:{
	   marginTop: 20,
	   paddingHorizontal:30,
   },
   button:{
	   color: '#ffffff',
	   textAlign: 'center',
	   height:41,
	   fontSize: 15,
	   lineHeight: 30,
	   backgroundColor: '#E31C0C',
   },
   option:{
	   marginTop: 18,
	   paddingHorizontal:30,
	   flexDirection: 'row',
   },
   register:{
	   color: '#4d4d4d',
   },
   back:{
	   textAlign: 'right',
	   color: '#4d4d4d'
   },
   tlogin_item:{
      flex:1,
      justifyContent:'center',
      alignItems:'center'
   },
   tlogin_img:{
      width:40,
      height:40,
      marginBottom:5
   },
   three_loginbox:{
     justifyContent:'flex-start',
   }
});
