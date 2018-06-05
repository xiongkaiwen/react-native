/**
*  余额支付页面
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
  TextInput
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';
// 按钮组件
import Button from './../../common/button';
// 我的订单页-用于支付成功后的跳转
import OrderList from './orders_list';
// 点击支付后的遮罩
import Requesting from './../../common/requesting';

var domain;
export default class UserEdit extends Component{
	constructor(props){
		super(props);
		// 订单详情
		var payOrderInfo;
		this.state={
			payPwd:'',// 支付密码
			loading:true,
		}
		// 是否有网络
		this.state.isConnected = true;
		// 绑定this
		this.getData = this.getData.bind(this);
		this.payOrder = this.payOrder.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	// 获取订单详情
	getData(){
		let that = this;
		let url = Utils.domain+'app/wallets/payment?tokenId='+global.tokenId+'&orderNo='+that.props.orderNo+'&isBatch='+that.props.isBatch;
		Utils.get(
				  url,
				  function(responData){
				  	if(responData.status==1){
				  		payOrderInfo = responData.data;
				  		domain = payOrderInfo.domain;
				  		that.setState({
				  			loading:false,
				  		});
				  	}else{
				  		// 订单已支付、返回上一页
				  		Utils.msg(responData.msg,'top');
				  		that.props.navigator.pop();
				  	}
				  },
				  function(err){
				  	console.log(err);
				  	// 网络请求超时或断网时 [TypeError: Network request failed]
					if(err.toString().indexOf('Network request failed')!=-1){
						Utils.msg('网络连接超时...');
						that.setState({
							isConnected:false
						});
					}
				  });
	}
	// 执行订单支付
	payOrder(){
		let that = this;
		// 显示请稍等
		that.showUploading(true);
		if(that.state.payPwd==''){
			Utils.msg('支付密码不能为空','center');
			return;
		}
		let url = Utils.domain+'app/wallets/payByWallet';
		let postData = {
			tokenId:global.tokenId,
			orderNo:that.props.orderNo,
			isBatch:that.props.isBatch,
			payPwd:that.state.payPwd
		}
		Utils.post(
				   url,
				   postData,
				   function(payRespon){
				   		// 关闭请稍等
						that.showUploading(false);
				   		Utils.msg(payRespon.msg,'center');
				   		if(payRespon.status==1){
				   			// 支付成功,跳转订单列表页
				   			if(that.props.isBatch==1){
				   				// 结算页面进入的余额支付
					   			that.props.navigator.replace({
					   				component:OrderList
					   			})
				   			}else{
				   				// 订单列表页面进入的余额支付
				   				that.props.navigator.replacePrevious({
					   				component:OrderList
					   			});
					   			that.props.navigator.pop();
				   			}
				   		}
				   },
				   function(err){
				   		// 关闭请稍等
						that.showUploading(false);
				   		Utils.msg('订单支付失败,请重试','center');
				   		console.log(err);
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
	// 渲染订单
	renderOrderItem(){
		let code = [];
		for(let i in payOrderInfo.list){
			let orders = payOrderInfo.list[i];
			code.push(
				<View key={i} style={styles.order_item}>
					{/*订单号-订单状态*/}
					<View style={[styles.item,styles.row,styles.head]}>
						<Text>订单号:{orders.orderNo}</Text>
						<Text style={styles.deliverMoney}>
							邮费:{orders.deliverMoney}
						</Text>
					</View>
					{/*订单下的商品*/}
		      		<View style={styles.order_goods_list}>
		      			{this.renderGoods(payOrderInfo.goods, orders.orderId)}
		      		</View>
				</View>
			);
		}
		return code;
	}
	// 渲染订单下的商品
	renderGoods(goodsData, orderId){
		let code = [];
		for(let i in goodsData[orderId]){
			let goods = goodsData[orderId][i];
				code.push(
						<View key={goods.goodsId} style={[styles.goods_item,styles.row]}>
		      				<Image source={{uri:domain+goods.goodsImg}} style={styles.goods_img} />
		      				<View style={styles.goods_info}>
			      				<Text numberOfLines={2} style={styles.goods_name}>
			      					{goods.goodsName}
			      				</Text>
		      					<Text style={styles.goods_spec}>
		      						{goods.goodsSpecNames.join('')}
		      					</Text>
		      				</View>
		      				<Text style={styles.goods_price_num}>￥{goods.goodsPrice} x{goods.goodsNum}</Text>
		      			</View>
				);
			
		}
		return code;
	}
	// 显示/隐藏 请稍等···
	showUploading(flag){
		this.refs.requesting.setState({requesting:flag});
	}
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return Utils.loading();
		}
		return(
			<View style={[styles.contrainer,styles.flex_1]}>
				{/* 头部 */}
				<Header initObj={{backName:' ',title:' 支付订单'}} 
					backEvent={()=>this.props.navigator.pop()}/>
				<ScrollView style={styles.main}>
					{this.renderOrderItem(payOrderInfo)}
					{/* 钱包余额、待支付订单总额 */}
					<View style={styles.user_money_box}>
						<Text style={styles.user_money}>
							钱包余额：
							<Text style={styles.red}>￥{payOrderInfo.userMoney}</Text>
							,待支付订单总额：
							<Text style={styles.red}>￥{payOrderInfo.totalMoney.toFixed(2)}</Text>
						</Text>
					</View>
					{/* 支付密码 */}
					<View style={[styles.row,styles.flex_1,styles.pay_pwd_box]}>
						<Text>支付密码：</Text>
						<TextInput 
							secureTextEntry={true}
							style={styles.pay_pwd}
							onChangeText={(val)=>this.setState({payPwd:val})}
							keyboardType={'numeric'}
							underlineColorAndroid={'transparent'}/>
					</View>
					{/* 按钮 */}
					<View style={styles.center}>
						<Button 
					 		onPress={()=>this.payOrder()} 
					 		style={[styles.order_btn,styles.center]} 
					 		textStyle={[styles.btn_text]} text={'确认支付'}/>
					</View>
				</ScrollView>
				{/* 请稍等... */}
				<Requesting ref="requesting" msg={'请稍等···'} />
			</View>
		);
	}
}


const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#f6f6f8',
	},
	flex_1:{flex:1},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	red:{
		color:'red'
	},
	gray:{
		color:'#9a9a9a'
	},
	text:{
		fontSize:15
	},
	row:{flexDirection:'row'},
	main:{
		height:height-50,
	},
	head:{
		marginTop:5,
	},
	addr:{
		backgroundColor:'#fff',
		marginBottom:5,
		padding:5,
	},
	addr_text:{
		paddingRight:5,
		color:'#9a9a9a'
	},
	item:{
		padding:5,
		backgroundColor:'#fff',
		justifyContent:'space-between',
		alignItems:'center',
		borderBottomWidth:1,
		borderBottomColor:'#eaeaea',
	},
	// 订单下的商品
	order_goods_list:{
		backgroundColor:'#fff'
	},
	goods_item:{
		paddingLeft:10,
		paddingRight:10,
		paddingBottom:5,
		paddingTop:5,
		borderBottomWidth:1,
		borderBottomColor:'#eaeaea',
	},
	goods_info:{
		flex:3,
		paddingLeft:10,
	},
	goods_spec:{
		color:'#ccc',
		fontSize:13
	},
	goods_price_num:{
		width:width*0.2,
		textAlign:'right'
	},
	goods_img:{
		width:height*0.1,
		height:height*0.1,
	},
	deliverMoney:{
		paddingRight:5,
	},
	user_money_box:{
		justifyContent:'space-around',
		alignItems:'center',
		backgroundColor:'#fff',
		marginTop:5,
		borderBottomWidth:1,
		borderBottomColor:'#ccc'
	},
	user_money:{
		margin:5,
	},
	pay_pwd_box:{
		backgroundColor:'#fff',
		justifyContent:'center',
		padding:10,
		paddingLeft:5,
		alignItems:'center',
		height:60,
	},
	pay_pwd:{
		borderWidth:1,
		borderColor:'#a0a0a0',
		width:width*0.55,
		borderRadius:2
	},
	order_btn:{
		marginTop:10,
		width:width*0.8,
		paddingTop:10,
		paddingBottom:10,
		borderWidth:1,
		borderColor:'#fdfdfd',
		borderRadius:5,
		backgroundColor:'#fff',
		marginLeft:5,
		marginBottom:10,
	},
	btn_text:{
		fontSize:16,
		color:'#00a5e0',
	}
});