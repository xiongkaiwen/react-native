import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
// 商品详情页
import GoodsDetail from './../../goods/goods_detail';
var domain;
export default class UserEdit extends Component{
	constructor(props){
		super(props);
		// 订单详情
		var orderDetail;
		this.state={
			loading:true,
		}
		// 是否有网络
		this.state.isConnected = true;
		// 绑定this
		this.getData = this.getData.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	// 获取订单详情
	getData(){
		let that = this;
		let url = Utils.domain+'app/orders/getDetail';
		let postData = {
			tokenId:global.tokenId,
			id:this.props.orderId,
			isShop:this.props.isShop
		}
		Utils.post(
				  url,
				  postData,
				  function(responData){
				  	if(responData.status==1){
				  		orderDetail = responData.data;
				  		domain = orderDetail.domain;
				  		that.setState({
				  			loading:false,
				  		});
				  	}else{
				  		// 未找到该订单信息、返回上一页
				  		Utils.msg(responData.msg,'top');
				  		that.props.navigator.pop();
				  	}
				  },
				  function(err){
				  		console.log('订单详情出错',err);
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
	// 渲染订单下的商品
	renderGoods(goodsData){
		let code = [];
		for(let i in goodsData){
			let goods = goodsData[i];
			code.push(
					<TouchableOpacity 
						activeOpacity={0.8}
						onPress={()=>this.props.navigator.push({
							component:GoodsDetail,
							passProps:{
								goodsId:goods.goodsId
						}})}
						key={goods.goodsId} 
						style={[styles.goods_item,styles.row]}>
	      				<Image source={{uri:domain+goods.goodsImg}} style={styles.goods_img} />
	      				<View style={styles.goods_info}>
		      				<Text style={styles.c13_333}>
		      					{goods.goodsName}
		      				</Text>
	      					<Text style={styles.goods_spec}>
	      						{(goods.goodsSpecNames!=null)?goods.goodsSpecNames.replace(/@@_@@/g,'\n\r'):''}                                         
	      					</Text>
	      				</View>
	      				<Text style={[styles.goods_price_num,styles.c13_333]}>￥{goods.goodsPrice} x{goods.goodsNum}</Text>
	      			</TouchableOpacity>
			);
		}
		return code;
	}
	// 渲染虚拟商品
	renderVirtual(data){
		let code = [];
		for(let i in data){
			let virtual = data[i];
			code.push(
				<View key={i} style={[styles.flex_1,styles.virtual]}>
      				<View style={[styles.row]}>
      				<Text>卡券号：{virtual.cardNo}</Text>
	      			</View>
	      			<View style={[styles.row]}>
	      				<Text>卡券密码：{virtual.cardPwd}</Text>
	      			</View>
      			</View>
			);
		}
		return code;
	}
	// 根据正常流程订单状态渲染线条
	renderStatusLine(orderStatus){
		/*
			 -3:用户拒收 -2:未付款的订单  -1：用户取消 0:待发货 1:配送中 2:用户确认收货
		*/
		let code;
		switch(orderStatus){
			// 待付款
			case -2:
				code = <View style={[styles.row,styles.center]}>
							<View style={styles.status_line1}></View>
								<Image source={require('./../../img/order_ok.png')} style={styles.status_ok} />
							<View style={styles.status_line_empty2}></View>
								<View style={[styles.status_circle_empty]}></View>
							<View style={styles.status_line_empty2}></View>
								<View style={[styles.status_circle_empty]}></View>
							<View style={styles.status_line_empty2}></View>
								<View style={[styles.status_circle_empty]}></View>
							<View style={styles.status_line_empty1}></View>
						</View>
			break;
			// 待发货
			case 0:
				code = <View style={[styles.row,styles.center]}>
							<View style={styles.status_line1}></View>
								<View style={[styles.status_circle]}></View>
							<View style={styles.status_line2}></View>
								<Image source={require('./../../img/order_ok.png')} style={styles.status_ok} />
							<View style={styles.status_line_empty2}></View>
								<View style={[styles.status_circle_empty]}></View>
							<View style={styles.status_line_empty2}></View>
								<View style={[styles.status_circle_empty]}></View>
							<View style={styles.status_line_empty1}></View>
						</View>
			break;
			// 已发货
			case 1:
				code = <View style={[styles.row,styles.center]}>
							<View style={styles.status_line1}></View>
								<View style={[styles.status_circle]}></View>
							<View style={styles.status_line2}></View>
								<View style={[styles.status_circle]}></View>
							<View style={styles.status_line2}></View>
								<Image source={require('./../../img/order_ok.png')} style={styles.status_ok} />
							<View style={styles.status_line_empty2}></View>
								<View style={[styles.status_circle_empty]}></View>
							<View style={styles.status_line_empty1}></View>
						</View>
			break;
			// 已收货
			case 2:
				code = <View style={[styles.row,styles.center]}>
							<View style={styles.status_line1}></View>
								<View style={[styles.status_circle]}></View>
							<View style={styles.status_line2}></View>
								<View style={[styles.status_circle]}></View>
							<View style={styles.status_line2}></View>
								<View style={[styles.status_circle]}></View>
							<View style={styles.status_line2}></View>
								<Image source={require('./../../img/order_ok.png')} style={styles.status_ok} />
							<View style={styles.status_line1}></View>
						</View>
			break;
		}
		return code;
	}
	// 渲染 取消拒收订单
	renderOrderClose(orderStatus){
		if(orderStatus==-1){
			return <View style={[styles.status_box,{alignItems:'flex-start',paddingLeft:15}]}>
						<Text style={styles.c13_666}>订单已取消</Text>
						<Text style={styles.c10_666}>{orderDetail.cancelDesc}</Text>
					</View>
		}else if(orderStatus==-3){
			return <View style={[styles.status_box,{alignItems:'flex-start',paddingLeft:15}]}>
						<Text style={styles.c13_666}>订单已拒收</Text>
						<Text style={styles.c10_666}>{orderDetail.cancelDesc}</Text>
					</View>
		}
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
				<Header initObj={{backName:' ',title:' 订单详情'}} 
					backEvent={()=>this.props.navigator.pop()}/>
				<ScrollView style={styles.main}>
					{/* 订单流程 */}
					{
						(orderDetail.orderStatus!=-3 && orderDetail.orderStatus!=-1)
						?
						<View style={[styles.status_box]}>
								{/* 线条 */}
								{this.renderStatusLine(orderDetail.orderStatus)}
								{/* 对应状态文字 */}
								<View style={[styles.row,styles.status_desc_box]}>
									<Text style={[styles.c13_333]}>
										{orderDetail.payType==1?'待付款':'已下单'}	
									</Text>
									<Text style={[styles.c13_333]}>待发货</Text>
									<Text style={[styles.c13_333]}>已发货</Text>
									<Text style={[styles.c13_333]}>已收货</Text>
								</View>	
						</View>
						:
						this.renderOrderClose(orderDetail.orderStatus)
					}
					

					{/* 收货地址 */}
					{
						(orderDetail.userName)
						?
						<View style={[styles.flex_1,styles.addr]}>
							{/*快递信息*/}
							{
								(orderDetail.expressId>0)
								?
								<View style={[styles.item,styles.row,styles.head]}>
									<Text style={styles.c13_666}>{orderDetail.expressName}：{orderDetail.expressNo}</Text>
								</View>
								:
								null
							}
							{
								(orderDetail.deliverType==0 && orderDetail.orderStatus==1)
								?
								<View style={[styles.row,styles.addr_head]}>
									<Image source={require('./../.././img/order_addr.png')} style={{width:11,height:11*0.916,marginRight:2.5}} />
									<Text style={styles.c13_666}>包裹正在飞往你的怀抱</Text>
								</View>
								:
								null
							}
							{
								orderDetail.deliverType==0
								?
								<View>
									<View style={[styles.row,styles.addr_info]}>
										<Text style={[styles.c10_666]}>收货人：{orderDetail.userName}</Text>
										<Text style={styles.c10_666}>{orderDetail.userPhone}</Text>
									</View>
									<View style={[styles.row,{alignItems:'center',paddingLeft:15,paddingRight:15}]}>
										<Image source={require('./../.././img/adress.png')} style={{width:10,height:10*1.095,marginRight:5}} />
										<Text numberOfLines={1} style={[styles.addr_text,styles.c10_666]}>
											收货地址：{orderDetail.userAddress}
										</Text>
									</View>
								</View>
								:
								<View style={[styles.row,{alignItems:'center',paddingLeft:15,paddingRight:15}]}>
									<Image source={require('./../.././img/adress.png')} style={{width:10,height:10*1.095,marginRight:5}} />
									<Text numberOfLines={1} style={[styles.addr_text,styles.c10_666]}>
										自提点：{orderDetail.shopAddress}
									</Text>
								</View>
							}
						</View>
						:
						null
					}
					
					{/*订单下的商品*/}
		      		<View style={styles.order_goods_list}>
		      			<View style={[styles.order_goods_head,styles.row]}>
		      				<Image source={require('./../../img/order_shop.png')} resizeMode={'cover'} style={{width:15,height:15*0.9,marginRight:5,}} />
		      				<Text style={styles.c13_333}>{orderDetail.shopName}</Text>
		      			</View>
		      			{this.renderGoods(orderDetail.goods)}
		      			<View style={[styles.row,styles.order_goods_bottom]}>
		      				<Text style={[styles.c11_999,{marginRight:5}]}>共{orderDetail.goods.length}件商品</Text>
			      			<Text style={styles.c13_333}>
			      				实付:￥{orderDetail.realTotalMoney}
			      			</Text>
		      			</View>
		      		</View>
		      		{/* 虚拟商品信息 */}
		      		
			      	{
			      		(orderDetail.goods[0].goodsType==1 && orderDetail.orderStatus==2)
			      		?
			      		this.renderVirtual(orderDetail.goods[0].extraJson)
			      		:
			      		null
			      	}
		      		
		      		{/* 其他订单信息 */}
		      		<View style={styles.order_info}>
		      			{/* 订单编号 */}
		      			<View style={[styles.row,styles.item]}>
							<Text style={[styles.c13_666]}>订单编号：{orderDetail.orderNo}</Text>
						</View>
		      			{/*下单时间*/}
			      		<View style={[styles.row,styles.item]}>
							<Text style={[styles.c13_666]}>下单时间：{orderDetail.createTime}</Text>
						</View>
						{/*获得积分*/}
						<View style={[styles.row,styles.item]}>
							<Text style={[styles.c13_666]}>获得积分：{orderDetail.orderScore}</Text>
						</View>
						{/*支付信息*/}
						<View style={[styles.row,styles.item]}>
							<Text style={[styles.c13_666]}>支付信息：{orderDetail.payInfo}</Text>
						</View>
						{/*配送信息*/}
						<View style={[styles.row,styles.item]}>
							<Text style={[styles.c13_666]}>配送信息：{orderDetail.deliverInfo}</Text>
						</View>
						{/*发票信息*/}
						<View style={[styles.row,styles.item]}>
							<Text style={[styles.c13_666]}>发票信息：
								{
									(orderDetail.isInvoice==1)
									?
									'需要'
									:
									'不需要'
								}
							</Text>
						</View>
						{/*发票抬头*/}
						{
							(orderDetail.isInvoice==1)
							?
							<View style={[styles.row,styles.item]}>
								<Text style={styles.c13_666}>发票抬头：
									{orderDetail.invoiceClient}
								</Text>
							</View>
							:
							null
						}
						{/*发票抬头*/}
						{
							(orderDetail.invoiceCode!=undefined)
							?
							<View style={[styles.row,styles.item]}>
								<Text style={styles.c13_666}>发票税号：
									{orderDetail.invoiceCode}
								</Text>
							</View>
							:
							null
						}
						{/* 退款信息 */}
						{
							(orderDetail.isRefund==1)
							?
							<View style={[styles.refund_info_box]}>
								<Text style={styles.c13_666}>退款信息：</Text>
								<View style={styles.refund_info}>
									<Text style={styles.c10_666}>
										退款金额：<Text style={[styles.c10_666,styles.red]}>￥{orderDetail.backMoney}</Text>
									</Text>
									<Text style={styles.c10_666}>
										退款备注：{orderDetail.refundRemark}
									</Text>
									<Text style={styles.c10_666}>
										退款时间：{orderDetail.refundTime}
									</Text>
								</View>
							</View>
							:
							null
						}

						{/*订单备注*/}
						{
							(orderDetail.orderRemarks!='' && orderDetail.orderRemarks!=null )
							?
							<View style={[styles.row,styles.item]}>
								<Text style={styles.c13_666}>订单备注：{orderDetail.orderRemarks}</Text>
							</View>
							:
							null
						}
					</View>

					<View style={[styles.order_info,{marginTop:10}]}>
						{/*商品总额*/}
						<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>商品总额</Text>
							<Text style={[styles.c13_666,styles.red]}>￥{orderDetail.goodsMoney}</Text>
						</View>
						{/*订单价格、运费、积分抵扣*/}
						<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>运费：</Text>
							<Text style={[styles.c13_666,styles.red]}>￥{orderDetail.deliverMoney}</Text>
						</View>
						{/* 是否开启积分支付 */}
						<View style={[styles.item,styles.row]}>
							<Text style={[styles.c13_666]}>积分抵扣金额：</Text>
							<Text style={[styles.c13_666,styles.red]}>￥-{orderDetail.scoreMoney}</Text>
						</View>

						<View style={[styles.order_price,styles.row]}>
							<Text style={[styles.c13_666]}>
								实付款：
								<Text style={[styles.c13_666,styles.red]}>￥{orderDetail.realTotalMoney}</Text>
							</Text>
						</View>
					</View>

				</ScrollView>
			</View>
		);
	}
}


const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#eee',
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
	c10_666:{
		fontSize:10,
		color:'#666'
	},
	c11_999:{
		fontSize:11,
		color:'#999',
	},
	c13_333:{
		fontSize:13,
		color:'#333'
	},
	c13_666:{
		fontSize:13,
		color:'#666'
	},
	text:{
		fontSize:15
	},
	row:{flexDirection:'row'},
	main:{
		height:height-50,
	},
	// 订单状态
	status_box:{
		backgroundColor:'#fff',
		alignItems:'center',
		paddingTop:10,
		paddingBottom:10,
	},
	status_line1:{
		width:width*0.1,
		height:1.5,
		backgroundColor:'#d82a2e'
	},
	status_line2:{
		width:width*0.2,
		height:1.5,
		backgroundColor:'#d82a2e'
	},
		// 灰色线
	status_line_empty1:{
		width:width*0.1,
		height:1.5,
		backgroundColor:'#ccc'
	},
	status_line_empty2:{
		width:width*0.2,
		height:1.5,
		backgroundColor:'#ccc'
	},
	status_circle:{
		width:10,
		height:10,
		borderWidth:1,
		backgroundColor:'#d82a2e',
		borderColor:'#d82a2e',
		borderRadius:5,
	},
		// 灰色空心圆
	status_circle_empty:{
		width:10,
		height:10,
		borderWidth:1,
		borderColor:'#ccc',
		borderRadius:5,
	},
	status_desc_box:{
		paddingLeft:10,
		paddingRight:10,
		marginTop:10,
		width:width,
		justifyContent:'space-around',
		alignItems:'flex-end',
	},
	status_ok:{
		width:13,
		height:13
	},
	head:{
		marginTop:5,
	},
	addr:{
		backgroundColor:'#fff',
		marginBottom:5,
		paddingTop:5,
		paddingBottom:5,
	},
	addr_head:{
		alignItems:'center',
		borderBottomWidth:1,
		borderBottomColor:'#eee',
		paddingTop:5,
		paddingBottom:5,
		paddingLeft:15,
		paddingRight:15,
	},
	addr_info:{
		padding:5,
		paddingLeft:15,
		paddingRight:15,
		justifyContent:'space-between',
	},
	addr_text:{
		paddingRight:5,
	},
	item:{
		backgroundColor:'#fff',
		justifyContent:'space-between',
		alignItems:'center',
		paddingBottom:5,
		paddingLeft:15,
		paddingRight:15,
	},
	// 订单下的商品
	order_goods_list:{
		backgroundColor:'#fff',
		marginTop:5,
		marginBottom:5
	},
	order_goods_head:{
		alignItems:'center',
		borderBottomWidth:1,
		borderBottomColor:'#eee',
		padding:5,
		paddingLeft:15,
	},
	order_goods_bottom:{
		justifyContent:'flex-end',
		alignItems:'center',
		padding:5,
		paddingLeft:15,
		paddingRight:15,
	},
	goods_item:{
		paddingLeft:15,
		paddingRight:15,
		paddingBottom:5,
		paddingTop:5,
		borderBottomWidth:1,
		borderBottomColor:'#eee',
	},
	goods_info:{
		flex:3,
		paddingLeft:15,
		paddingRight:15,
	},
	goods_spec:{
		color:'#ccc',
		fontSize:12
	},
	goods_price_num:{
		width:width*0.2,
		textAlign:'right'
	},
	goods_img:{
		width:width*0.213,
		height:width*0.213,
	},
	// 退款信息
	refund_info_box:{
		backgroundColor:'#fff',
		paddingLeft:15,
		paddingRight:15,
	},
	refund_info:{
		padding:5,
		paddingLeft:15,
	},
	// 其他订单信息
	order_info:{
		paddingTop:5,
		backgroundColor:'#fff',
		marginTop:5,
	},
	// 订单总价格
	order_price:{
		backgroundColor:'#fff',
		justifyContent:'flex-end',
		alignItems:'center',
		borderTopWidth:1,
		borderColor:'#eee',
		padding:15,
		paddingTop:10,
		paddingBottom:10,
	},
	// 虚拟商品信息
	virtual:{
		justifyContent:'space-between',
		backgroundColor:'#fff',
		marginTop:5,
		padding:5,
		paddingLeft:15,
		paddingRight:15,
		minHeight:height*0.1,
	},
});