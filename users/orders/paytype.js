/**
* 选择支付方式
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  NetInfo,
  InteractionManager
} from 'react-native';

// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from './../../common/header';
//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
// 图标组件
import Icon1 from 'react-native-vector-icons/MaterialIcons';
// 支付宝支付组件
import Alipay from 'react-native-yunpeng-alipay';
// 余额支付页
import Wallets from './orders_pay_wallets';
// 微信支付组件
import * as WeChat from 'react-native-wechat';
// 点击支付后的遮罩
import Requesting from './../../common/requesting';

export default class PayType extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading:true,
		};
	}
	/*************************************************************************** 支付相关start ***************************************************************************/
	pay(PayType,flag){
		let that = this;
		switch(PayType){
			case 'weixin':
			// 发起微信支付
			that.weixinpays();
			break;
			case 'alipay':
			// 发起支付宝支付
			that.alipays(flag);
			break;
			// 默认为余额支付
			default:
			that.props.navigator.replace({
				component:Wallets,
				passProps:{
					orderNo:that.props.orderNo
				}
			});
			break;
		}
	}
	// 显示/隐藏 请稍等···
	showUploading(flag){
		this.refs.requesting.setState({requesting:flag});
	}
	// 微信支付
	weixinpays(){
		let that = this;
		// 显示请稍等
		that.showUploading(true);

	    let url = Utils.domain+'app/payments/weixinPay';
	    let postData = {
	      tokenId:global.tokenId,
	      isBatch:0,
	      orderNo:that.props.orderNo,
	    }
	    // 检测是否有安装微信
	    let _hasWechat = WeChat.isWXAppInstalled();
	    _hasWechat.then((val)=>{
	      if(val){
	        Utils.post(
	               url,
	               postData,
	               (responData)=>{
	               	// 关闭请稍等
					that.showUploading(false);

	                if(responData.status==1){
	                    let _payInfo = responData.data[0];
	                    let _payObj = {
	                                partnerId: _payInfo.partnerid, // 商家向财付通申请的商家id
	                                prepayId: _payInfo.prepayid, // 预支付订单
	                                nonceStr: _payInfo.noncestr, // 随机串，防重发
	                                timeStamp: _payInfo.timestamp, // 时间戳，防重发
	                                package: _payInfo.package, // 商家根据财付通文档填写的数据和签名
	                                sign: _payInfo.sign // 商家根据微信开放平台文档对数据做的签名
	                              }
	                   const result = WeChat.pay(_payObj);
	                   result.then((res)=>{
	                      Utils.msg('订单支付成功');
	                      // 支付成功跳转我的订单页
	                      that.paySuccess(res);
	                   }).catch((err)=>{
	                      Utils.msg('订单支付失败');
	                      console.log(err);
	                      // 支付失败跳转我的订单页
	                      that.payFail();
	                      //that.paySuccess(err);
	                   });

	                }else{
	                  // 订单已支付或库存不足
	                  Utils.msg(responData.msg);
	                }
	               },
	               (err)=>{
	               	  // 关闭请稍等
					  that.showUploading(false);

	               	  Utils.msg('请求微信支付接口失败');
	                  console.log('请求微信支付接口出错',err);
	               });
	      }else{
	      	// 关闭请稍等
			that.showUploading(false);
	        Utils.msg('未安装微信,无法进行微信支付');
	        that.payFail();
	        return;
	      }
	    });
	}
	// 支付宝支付
	alipays(flag){
		let that = this;
		// 没有orderId
		if(!that.props.orderNo){
			that.payFail('无法发起支付,请联系商城管理员');
			return;
		}
		let url = Utils.domain+'app/payments/alipay?tokenId='+global.tokenId+'&isBatch=0&orderNo='+that.props.orderNo;
		if(flag){// 分期支付
			url = Utils.domain+'app/payments/pcreditAlipays?tokenId='+global.tokenId+'&isBatch=0&orderNo='+that.props.orderNo;
		}
		Utils.orderPay(
					   url,
					   (orderString)=>{
					   		Alipay.pay(orderString).then((data)=>{
					   				let _obj = {};
					   				if(global._platfrom=='ios'){
						   				_obj.resultStatus = data[0].resultStatus;
					   				}else{
					   					let _data = data.split(';');
						   				_obj.resultStatus = that._getValue(_data[0],'resultStatus');
						   				_obj.memo = that._getValue(_data[1],'memo');
						   				_obj.result = that._getValue(_data[2],'result');	
					   				}
			                    	if (_obj.resultStatus) {
		                            /*处理支付结果*/
		                            switch (_obj.resultStatus) {
		                               case "9000":
		                               	 // 支付成功
		                                 that.paySuccess(_obj)
		                                 break;
		                               case "8000":
		                                 that.payFail('支付结果未知,请查询订单状态')
		                                 break;
		                               case "4000":
		                                 that.payFail('订单支付失败')
		                                 break;
		                               case "5000":
		                                 that.payFail('重复请求')
		                                 break;
		                               case "6001":
		                                 that.payFail('用户中途取消')
		                                 break;
		                               case "6002":
		                                 that.payFail('网络连接出错')
		                                 break;
		                               case "6004":
		                                 that.payFail('支付结果未知,请查询订单状态')
		                                 break;
		                               default:
		                                 that.payFail('其他失败原因')
		                                 break;
		                             }
		                           } else {
		                             that.payFail('其他失败原因')
		                           }
			                },  (err)=>{
			                	that.payFail('');
			                    console.log('支付出错',err);
			                });
					   },
					   (err)=>{
					   		that.payFail('支付失败');
					   		console.log('请求支付出错',err);
					   });
	}
	_getValue(content, key) {
        let prefix = key + "={";
        return content.substring(content.indexOf(prefix) + prefix.length,
        	content.lastIndexOf("}"));
    }
	// 支付成功
	paySuccess(data){
		// 刷新并跳转我的订单页
		this.props.refresh();
		this.props.navigator.pop();
	}
	// 支付失败
	payFail(msg){
		// 刷新并跳转我的订单页
		this.props.refresh();
		this.props.navigator.pop();
	}

	/*************************************************************************** 支付相关end ***************************************************************************/

	// 渲染头部
	renderHeader(){
	  return(<Header 
	  		initObj={{backName:'',title:'支付方式'}} 
	  		backEvent={()=>{this.props.navigator.pop()}}/>);
	}
	render(){
		return(
			<View style={styles.container}>
				{this.renderHeader()}
				<View style={[styles.main]}>
					<TouchableOpacity onPress={()=>this.pay('wallets')} style={[styles.row,styles.pay_item]}>
						<View style={[styles.flex_1,styles.row,]}>
	      					<Image source={require('./../../img/wallets.png')} style={styles.pay_icon} />
							<Text>余额支付</Text>
						</View>
						<View style={{justifyContent:'center'}}>
	      					<Icon1 name={'keyboard-arrow-right'} size={30} color={'#c7c7c7'} />
	      				</View>
					</TouchableOpacity>

					<TouchableOpacity onPress={()=>this.pay('alipay')} style={[styles.row,styles.pay_item]}>
						<View style={[styles.flex_1,styles.row,]}>
	      					<Image source={require('./../../img/alipay.png')} style={styles.pay_icon} />
							<Text>支付宝</Text>
						</View>
						<View style={{justifyContent:'center'}}>
	      					<Icon1 name={'keyboard-arrow-right'} size={30} color={'#c7c7c7'} />
	      				</View>
					</TouchableOpacity>

					<TouchableOpacity onPress={()=>this.pay('alipay',true)} style={[styles.row,styles.pay_item]}>
						<View style={[styles.flex_1,styles.row,]}>
	      					<Image source={require('./../../img/huabei.png')} style={styles.pay_icon} />
							<Text>花呗分期支付</Text>
						</View>
						<View style={{justifyContent:'center'}}>
	      					<Icon1 name={'keyboard-arrow-right'} size={30} color={'#c7c7c7'} />
	      				</View>
					</TouchableOpacity>

					<TouchableOpacity onPress={()=>this.pay('weixin')} style={[styles.row,styles.pay_item]}>
						<View style={[styles.flex_1,styles.row,]}>
	      					<Image source={require('./../../img/wechat.png')} style={styles.pay_icon} />
							<Text>微信支付</Text>
						</View>
						<View style={{justifyContent:'center'}}>
	      					<Icon1 name={'keyboard-arrow-right'} size={30} color={'#c7c7c7'} />
	      				</View>
					</TouchableOpacity>
				</View>
				{/* 请稍等... */}
				<Requesting ref="requesting" msg={'请稍等···'} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   flex_1:{
		flex:1,
	},
	row:{
		flexDirection:'row'
	},
	green:{
		color:'#18c328',
		fontWeight:'bold'
	},
	center:{
		justifyContent:'center',
		alignItems:'center'
	},
	main:{
		marginTop:10,
	},
	pay_item:{
		alignItems:'center',
		backgroundColor:'#fff',
		padding:5,
		paddingRight:0,
		borderBottomWidth:1,
		borderBottomColor:'#eee',
	},
	pay_icon:{
		width:20,
		height:20,
		marginRight:5
	}
});