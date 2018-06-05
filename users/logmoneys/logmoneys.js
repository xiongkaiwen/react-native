/**
* 我的资金
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TouchableHighlight,
  TextInput,
  NetInfo,
  Modal,
  InteractionManager
} from 'react-native';
// modal组件
import MyModal from 'react-native-root-modal';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';

//提现记录
import CashDraws from './cashdraws';
//提现
import Withdrawals from './withdrawals';
//我的提现账户
import CashconfigsList from './cashconfigs_list';
//支付密码
import Security from '../security/security';
// 资金流水
import MoneyRecord from './money_record';


//积分数据
var moneysData;

export default class Moneys extends Component {
	constructor(props){
		super(props);
	    this.state = {  
	    	payshow:false,
	    	topayshow:false,
	    	pay:''
	    };
	    // 是否有网络
		this.state.isConnected = true;
		// 是否加载数据
		this.state.loading = true;
		this.success = this.success.bind(this);
		this.toPayPass = this.toPayPass.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	moneysData = data.data;
	if(moneysData){
		this.setState({
			loading:false
		  });
		}
	}

 // 获取数据
  getData(){
  	let that = this;
	Utils.get(Utils.domain+'app/logmoneys/usermoneys?tokenId='+global.tokenId,this.success,function(err){
				console.log('资金管理列表出错',err);
		  		// 网络请求超时或断网时 [TypeError: Network request failed]
				if(err.toString().indexOf('Network request failed')!=-1){
					Utils.msg('网络连接超时...','top');
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
  
  //验证支付密码
  verifyPay(){
	  let that = this;
	  let pay  = this.state.pay;
	  if(pay==''){
		  Utils.msg('请输入支付密码','top');
		  return;
	  }
		// 请求接口
		Utils.post(Utils.domain+'app/logmoneys/checkPayPwd',
			{tokenId:global.tokenId,payPwd:pay},
			function(responData){
				if(responData.status==1){
					// 隐藏modal
					that.payModalVisible();
					// 重新请求数据渲染页面
					that.props.navigator.push({component:CashconfigsList});
				}else{
					Utils.msg(responData.msg,'top');
				}
			},
			function(err){
				Utils.msg('验证失败','top');
			});
  }
  //设置
  toPayPass(){
	  this.topayModalVisible();
	  this.props.navigator.push({component:Security});
  }
  
  payButtonClick(){
	  if(moneysData.isSetPayPwd==1){
		  this.payModalVisible();  
	  }else{
		  this.topayModalVisible();  
	  }
  } 
  // 进入资金流水记录页面 
  moneyRecord(){
  	this.props.navigator.push({
  		component:MoneyRecord,
  	})
  }
	  
  // 显示/隐藏 modal  
  payModalVisible() {  
    let isShow = this.state.payshow;  
    this.setState({  
    	payshow:!isShow,  
    });  
  }	  
  // 显示/隐藏 modal  
  topayModalVisible() {  
    let isShow = this.state.topayshow;
    this.setState({  
    	topayshow:!isShow,  
    });  
  }

  // 渲染头部
  renderHeader(){
	  return(<Header 
	  		titleTextStyle={{marginLeft:20}}
	  		initObj={{backName:'',title:'我的资金'}} 
	  		backEvent={()=>{this.props.navigator.pop()}} 
	  		showRight={true} rightText={'提现记录'} 
	  		rightTextStyle={{fontSize:13,color:'#333'}}
	  		onPress={()=>{this.props.navigator.push({component:CashDraws});}}/>);
  }
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	// 请求数据中
	/*if(this.state.loading){
		return Utils.loading();
	}*/
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
         	 <View style={styles.purse}>
         	 	<Image source={require('../../img/img_wdye.png')} resizeMode={'cover'} style={{marginTop:5,width:Utils.width*0.5,height:Utils.width*0.5*0.66}}/>
         	 	<Text style={styles.money}>￥{moneysData!=undefined?moneysData.userMoney:''}</Text>
	         </View>
      	 	<View style={styles.cash}><TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>{this.props.navigator.push({component:Withdrawals});}}>
	      	 	<Image source={require('../../img/icon_tixian.png')} style={{width:18,height:18,marginRight:3}}/>
	      	 	<Text style={styles.cashs}>提现</Text>
      	 	</TouchableOpacity></View>
      	 	<View style={styles.account}>
	      	 	<Text style={[styles.c13_333,{flex: 1,}]} onPress={this.payButtonClick.bind(this)}>我的提现账户</Text>
	      	 	<Text style={[styles.c13_333,{flex: 1, textAlign: 'right',}]} onPress={this.payButtonClick.bind(this)}>{moneysData!=undefined?moneysData.num:''}个 ></Text>
      	 	</View>
      	 	<View style={styles.account}>
	      	 	<Text style={[styles.c13_333,{flex: 1}]} onPress={this.moneyRecord.bind(this)}>资金流水记录</Text>
	      	 	<Text style={[styles.c13_333,{flex: 1, textAlign: 'right'}]} onPress={this.moneyRecord.bind(this)}> > </Text>
      	 	</View>
            <MyModal  
            	style={styles.modalStyle}
	            visible={this.state.payshow}>  
	              <View style={styles.subView}>  
	                <Text style={styles.contentText}>
	                请输入支付密码：
	                </Text>
	                <TextInput keyboardType={'numeric'} style={styles.logininput} underlineColorAndroid={'transparent'} secureTextEntry={true} maxLength={6} onChangeText={(val)=>this.setState({pay:val})}/>
	                <View style={styles.horizontalLine} />  
	                <View style={styles.buttonView}>  
	                  <TouchableHighlight underlayColor='transparent'  
	                    style={styles.buttonStyle}  
	                    onPress={this.payModalVisible.bind(this)}>  
	                    <Text style={styles.buttonText}>  
	                      取消  
	                    </Text>  
	                  </TouchableHighlight>  
	                  <View style={styles.verticalLine} />  
	                  <TouchableHighlight underlayColor='transparent'  
	                    style={styles.buttonStyle}  
	                    onPress={this.verifyPay.bind(this)}>  
	                    <Text style={styles.buttonText}>  
	                      确定  
	                    </Text>  
	                  </TouchableHighlight> 
	                </View>  
	              </View>  
	         </MyModal>
	        <Modal  
	        	transparent={true}
	            visible={this.state.topayshow}
	            onShow={() => {}}  
	            onRequestClose={() => {}} >  
	            <TouchableOpacity style={styles.modalStyle} onPress={this.topayModalVisible.bind(this)}>
	              <View style={styles.subView}>  
	                <Text style={[styles.contentText,{textAlign:'center'}]}>
	                	你还未设置支付密码
	                </Text>
	                <TouchableOpacity style={{padding:20}} onPress={this.topayModalVisible.bind(this)}>
	                	<Text style={styles.buttonTexts} onPress={this.toPayPass}>去设置</Text>
	                </TouchableOpacity>
	              </View>  
	            </TouchableOpacity>  
	         </Modal>
      	 	<View style={{marginTop: 30,paddingLeft:10,}}>
      	 		<Text style={[styles.c13_333,{marginBottom:15,}]}>首次提现步骤：</Text>
      	 		<Text style={[styles.c13_333,{marginBottom:10,}]}>1.设置支付密码和绑定手机号码</Text>
      	 		<Text style={styles.c13_333}>2.绑定您的微信钱包或银行卡</Text>
      	 	</View>
	    </ScrollView>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#fff',
   },
   purse:{
	   backgroundColor: '#d82b2f',
	   alignItems: 'center',
	   paddingTop:5,
	   paddingBottom:5
   },
   c13_333:{
   	   fontSize:13,
   	   color:'#333',
   },
   money:{
	   marginTop: 8,
	   fontSize: 18,
	   color: '#ffffff',
	   textShadowColor:'#000',
	   textShadowOffset:{width:1,height:1}
   },
   cash:{
	   backgroundColor: '#d82b2f',
	   alignItems: 'center',
	   paddingTop:8,
	   paddingBottom:8
   },
   cashs:{
	   color: '#ffffff',
	   fontSize: 13
   },
   account:{
	   padding:10,
	   backgroundColor: '#ffffff',
	   flexDirection: 'row',
	   borderBottomWidth:1,
	   borderBottomColor:'#eee',
   },
   // modal的样式  
   modalStyle: {  
     backgroundColor:'rgba(0,0,0,0.5)',  
     width:Utils.width,
     height:Utils.height,
   },
   // modal上子View的样式  
   subView:{  
   	 top:Utils.height*0.3,
     marginLeft:50,  
     marginRight:50,  
     backgroundColor:'#fff',  
     alignSelf: 'stretch',  
     justifyContent:'center',  
     borderRadius: 10,  
     borderWidth: 0.5,  
     borderColor:'#ccc',  
   },  
   // 内容  
   contentText:{  
     marginTop:10,
     padding:10,
     paddingBottom:0,
     fontSize:16,
   },  
   // 水平的分割线  
   horizontalLine:{  
     marginTop:5,  
     height:0.5,  
     backgroundColor:'#ccc',  
   },  
   // 按钮  
   buttonView:{  
     flexDirection: 'row',  
     alignItems: 'center',  
   },  
   buttonStyle:{  
     flex:1,  
     height:44,  
     alignItems: 'center',  
     justifyContent:'center',  
   },  
   // 竖直的分割线  
   verticalLine:{  
     width:0.5,  
     height:44,  
     backgroundColor:'#ccc',  
   },  
   buttonText:{  
     fontSize:16,  
     color:'#3393F2',  
     textAlign:'center',  
   },
   buttonTexts:{
	 fontSize:16,
	 textAlign: 'center',
	 borderRadius: 3,
	 color:'#ffffff',
	 height:40,
	 lineHeight: 29,
	 backgroundColor: '#e00102',
   },
   logininput:{
	   height:40,
	   borderColor: '#a0a0a0',
	   borderWidth:1,
	   marginBottom: 10,
	   borderRadius: 2,
	   margin: 10
   },
});