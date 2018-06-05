import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../common/refresh';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
// 头部
import Header from './../common/header';
// 工具类
import Utils from './../common/utils';
// 底部
import Bottom from './settlement_bottom';
// 弹出层
import Popup from './settlement_modal';
import Deliver from './settlement_deliver';
import Invoice from './settlement_invoice';
import Score from './settlement_score';

// 我的订单-用于下单成功后的跳转
import OrdersList from './../users/orders/orders_list';

// 余额支付页-用于下单成功后的跳转
import WalletsPay from './../users/orders/orders_pay_wallets';

// 地址页
import UserAddress from './../users/useraddress/useraddress';
// 支付宝支付
import Alipay from 'react-native-yunpeng-alipay';
// 微信支付
import * as WeChat from 'react-native-wechat';

// 点击支付后的遮罩
import Requesting from './../common/requesting';

let {width,height} = Utils;
export default class Settlement extends Component{
	constructor(props){
		super(props);
		// 结算数据
		var data,domain;
		// 弹出层对象
		var pay,deliver,invoice;


		this.state = {};
		// 是否有网络
		this.state.isConnected = true;
		// 加载中
		this.state.loading = true;


		// 支付方式、送货方式、发票信息、是否使用积分
		this.state.payName = '';
		this.state.deliverName = '快递运输';
		this.state.invoiceName = '不需发票';
		this.state.scoreName = '否';


		// 可用积分,积分可抵扣金额
		this.state.userOrderScore = 0;
		this.state.userOrderMoney = 0;

		  /*'s_addressId' => '8',
		  's_areaId' => '441600',
		  'payType' => '0',
		  'payCode' => 'cod',

		  'isUseScore' => '0',
		  'useScore' => '0',

		  'remark_2' => '',
		  'deliverType' => '0',
		  'isInvoice' => '0',
		  'invoiceClient' => '',*/


		this.state.totalMoney = 0;
		// **************************即将被post的参数

		/********  获取数据后设置 **********/
		this.state.s_addressId = 0;
		this.state.s_areaId = 0;
		this.state.payType = '';
		this.state.payCode = '';

		this.state.deliverType = 0; // 默认快递运输
		this.state.isInvoice = 0;// 默认不需要发票
		this.state.invoiceClient = '';// 发票抬头
		this.state.isUseScore = 0; // 默认不使用积分
		this.state.invoiceId = 0;// 发票信息id


		// 绑定this
		this.commitChose = this.commitChose.bind(this);
		this.remarks = this.remarks.bind(this);
		this.orderSubmit = this.orderSubmit.bind(this);
		this.getCartMoney = this.getCartMoney.bind(this);
		this.goToAddress = this.goToAddress.bind(this);
		this._onRefresh = this._onRefresh.bind(this);

	}
	componentWillReceiveProps(nextProps){
		console.log('结算页面接收新属性');
		this.getData();
	}
	getData(){
		let that = this;
		let url = Utils.domain+'app/carts/settlement';
		let postData = {
			tokenId:global.tokenId,
			addressId:this.props.addressId,
		};
		Utils.post(
			url,
			postData,
			(responData)=>{
				if(responData.status==1){
					domain = responData.data.domain;
					data = responData.data;
					// 设定参数
					let setParam = {};
					// 设定收货地址
					if(Object.keys(data.userAddress).length>0){
						setParam.s_addressId = data.userAddress.addressId;
						setParam.s_areaId = data.userAddress.areaId;
					}
					// 设定支付方式
					if(Object.keys(data.payments).length>0){
						// 存在在线支付,则默认为第一项在线支付,否则为货到付款
						if(data.payments[1]!==undefined && data.payments[1][0]!==undefined){
							setParam.payName = data.payments[1][0].payName;
							setParam.payType = 1;
							setParam.payCode = data.payments[1][0].payCode;
						}else if(data.payments[0]!==undefined && data.payments[0][0]!==undefined){
							setParam.payName = data.payments[0][0].payName;
							setParam.payType = 0;
							setParam.payCode = data.payments[0][0].payCode;
						}else{
							// 若无支付方式,则默认为在线支付.
							setParam.payType = 1;
							setParam.payCode = '';
						}
					}
					// 设置不在配送区域内的商品
					for(let i in data.canNotBuyIds){
						setParam['goods_flag_'+data.canNotBuyIds[i]] = true;
					}
					// 设定店铺备注 及 店铺运费、商品价格
					let shopIds = Object.keys(data.carts);
					for(let i in shopIds){
						let remarks = 'remark_'+shopIds[i];
						setParam[remarks] = '';

						let freight = 'freight_'+shopIds[i];
						let goodsMoney = 'goodsMoney_'+shopIds[i];
						setParam[freight] = 0;
						setParam[goodsMoney] = 0;
					}
					// 调用接口计算运费
					that.getCartMoney();

					that.setState(setParam);
					that.setState({loading:false});
				}else{
					// 没有数据,弹出当前页
					Utils.msg(responData.msg);
					that.props.navigator.pop();
				}
			},
			(err)=>{
				console.log('结算页面出错',err);
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


	// 点击显示弹出层
	showPopup(type){
		pay.setState({isShow:true});
	}
	// 获取运费,及购物车价格
	getCartMoney(deliverType, isUseScore){
		let that = this;
		let url = Utils.domain + 'app/carts/getCartMoney';
		let postData = {
			tokenId: global.tokenId,
			areaId2:(data.userAddress.areaId2)?data.userAddress.areaId2:0,
			deliverType:deliverType!==undefined?deliverType:that.state.deliverType,
			isUseScore:isUseScore,
			useScore:isUseScore==1?data.userOrderScore:0,
		};
		Utils.post(
				   url,
				   postData,
				   (responData)=>{
				   		if(responData.status==1){
				   			let money = responData.data;
				   			let newPrice = {};
				   			for(let i in money.shops){
				   				let freight = 'freight_'+i;
								let goodsMoney = 'goodsMoney_'+i;
				   				newPrice[freight] = money.shops[i].freight;
				   				newPrice[goodsMoney] = money.shops[i].goodsMoney;
				   			}
				   			newPrice.totalMoney = money.realTotalMoney;
				   			// 可用积分
				   			newPrice.userOrderScore = money.maxScore;
				   			// 可抵扣金额
				   			newPrice.userOrderMoney = money.maxScoreMoney;
				   			that.setState(newPrice);
				   		}
				   },
				   (err)=>{
				   		console.log(err);
				   		Utils.msg('出错了');
				   });
	}


	// 确定选择
	commitChose(type, name, postData){
		let obj = {};
		// 针对不同的
		switch(type){
			case 'pay':
			obj.payType = postData.payType;
			obj.payCode = postData.payCode;
			break;
			case 'deliver':
			obj.deliverType = postData.deliverType;
			this.getCartMoney(postData.deliverType, this.state.isUseScore);
			break;
			case 'invoice':
			obj.isInvoice = postData.isInvoice?1:0;
			obj.invoiceClient = postData.invoiceClient;
			obj.invoiceId = postData.invoiceId;
			break;
			case 'score':
			obj.isUseScore = postData.isUseScore;
			break;
		}
		let index = type+'Name';
		obj[index] = name;
		// 设置配送方式
		if(type=='deliver'){
			if(obj.deliverType==1){
				// 为自提，则不做区域限制
				for(let i in data.canNotBuyIds){
					obj['goods_flag_'+data.canNotBuyIds[i]] = undefined;
				}
			}else{
				// 设置不在配送区域内的商品
				for(let i in data.canNotBuyIds){
					obj['goods_flag_'+data.canNotBuyIds[i]] = true;
				}
			}
		}


		this.setState(obj);
		// 使用积分,重新计算价格
		if(type=='score')this.getCartMoney(this.state.deliverType, postData.isUseScore);
	}
	// 记录订单备注
	remarks(shopId, value){
		let obj = {};
		let index = 'remark_'+shopId;
		obj[index] = value;
		this.setState(obj);
	}
	// 提交订单
	orderSubmit(){
		let that = this;
		let url = Utils.domain+'app/orders/submit';
		// 直接将state作为参数传递
		let postData = that.state;
			// 明确订单来源
			postData.orderSrc = global._platfrom;
		// 判断是否使用积分
		postData.useScore = (that.state.isUseScore==1)?data.userOrderScore:0;
		postData.tokenId = global.tokenId;
		// 分享者id
		postData.sharerId = global.shareId;
		Utils.post(
				url,
				postData,
				(responData)=>{
					if(responData.status==1){
						if(parseFloat(that.state.totalMoney)<=0){
							// 积分已经够支付,则直接跳转我的订单页
							that.props.navigator.replace({
									component:OrdersList
							});
							return;
						}
						// 订单提交成功,跳转回购物车页面,  ######若为在线支付则发起支付
						// 判断当时是否为在线支付
						if(postData.payType==1){
							// # 根据选择的支付方式来决定跳转发起的支付
							switch(postData.payCode){
								// 花呗分期支付
								case 'pcreditalipays':
									that.alipays(responData.data,true);
								break;
								// 支付宝支付
								case 'alipays':
									that.alipays(responData.data);
								break;
								// 微信支付
								case 'app_weixinpays':
									that.weixinpays(responData.data);
								break;
								// 余额支付
								case 'wallets':
									// 弹出结算页面,跳转余额支付页
									that.props.navigator.replace({
										component:WalletsPay,
										passProps:{
											orderNo:responData.data,
											isBatch:'1'
										}
									});
								break;
							}

						}else{
							// 弹出结算页面,跳转我的订单页
							that.props.navigator.replace({
								component:OrdersList
							});
						}
					}
					if(responData.status==-1 && responData.data!=undefined){
							let _obj = {};
							for(let i in responData.data){
								_obj['goods_flag_'+responData.data[i]] = true;
							}
							this.setState(_obj);
					}
					Utils.msg(responData.msg);
				},
				(err)=>{
					console.log(err);
				});
	}
	// 显示/隐藏 请稍等···
	showUploading(flag){
		this.refs.requesting.setState({requesting:flag});
	}
	// 微信支付
	weixinpays(orderNo){
		let that = this;
		// 显示请稍等
		that.showUploading(true);

	    let url = Utils.domain+'app/payments/weixinPay';
	    let postData = {
	      tokenId:global.tokenId,
	      isBatch:1,
	      orderNo:orderNo,
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
	alipays(orderNo,flag){
		let that = this;
		let url = Utils.domain+'app/payments/alipay?tokenId='+global.tokenId+'&isBatch=1&orderNo='+orderNo;
		if(flag){
			url = Utils.domain+'app/payments/pcreditAlipays?tokenId='+global.tokenId+'&isBatch=1&orderNo='+orderNo;
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
			                },  (err)=> {
			                	that.payFail('支付失败');
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
		// 跳转我的订单页
		this.props.navigator.replace({
			component:OrdersList
		});
	}
	// 支付失败
	payFail(msg){
		//Utils.msg(msg);
		// 跳转我的订单页
		this.props.navigator.replace({
			component:OrdersList
		});
	}
	// 进入地址页
	goToAddress(){
		let addressId = data.userAddress.addressId || '0';
		this.props.navigator.push({
			component:UserAddress,
			passProps:{
				type:1,
				addressId:addressId
			}
		});
	}

	renderAddress(){
		let code = '';
		if(Object.keys(data.userAddress).length>0){
			let addr = data.userAddress;
			code = <View style={[styles.flex_1,{paddingRight:15}]}>
			 			<Text>{addr.userName} {addr.userPhone}</Text>
			 			<View style={[styles.row,{alignItems:'center'}]}>
				 				<Icon name={'room'} size={15} color={'red'} />
			 				<Text numberOfLines={1}>{addr.areaName}-{addr.userAddress}</Text>
			 			</View>
			 		</View>
		}else{
			code = <View style={[styles.flex_1,{paddingRight:15}]}>
			 			<Text>您还没添加收货地址，请添加。</Text>
			 		</View>
		}
		return code;
	}
	// 渲染店铺
	renderShopItem(){
		let code = [];
		for(let i in data.carts){
			let shop = data.carts[i];
			let freight = 'freight_'+i;
			let goodsMoney = 'goodsMoney_'+i;

			code.push(
				<View key={i} style={styles.order_item}>
				 		<Text style={styles.shop_name}>{shop.shopName}</Text>
				 		{/*商品清单*/}
				 		<View style={[styles.goods_list]}>
				 			{this.renderShopGoods(shop.list)}
				 		</View>
				 		<View style={[styles.row,styles.item]}>
				 			<Text>运费：</Text>
				 			<Text style={styles.red}>￥{this.state[freight].toFixed(2)}</Text>
				 		</View>
				 		<View style={[styles.row,styles.item]}>
				 			<Text>店铺合计(含运费)：</Text>
				 			<Text style={styles.red}>￥{this.state[goodsMoney].toFixed(2)}</Text>
				 		</View>
				 		<TextInput 
				 			style={styles.remarks}
				 			placeholder='填写订单备注'
				 			multiline={false}
				 			onChangeText={(value)=>this.remarks(i,value)}
				 			underlineColorAndroid="transparent" />
				 	</View>
			);
		}
		return code;
	}
	// 渲染店铺下的商品
	renderShopGoods(goods){
		let code = [];
		for(let i in goods){
			let gData = goods[i];
			code.push(
			   <View key={i} style={{position:'relative'}}>
				<View  style={[styles.goods_item,styles.row]}>
						<Image source={{uri:domain+gData.goodsImg}} style={styles.goods_img} />
						<View style={styles.goods_info}>
							<Text style={[styles.goods_text]}>{gData.goodsName}</Text>
							
							{
								(gData.specNames.length>0)?
								<Text style={[styles.goods_spec]}>
									规格：{this.renderSpec(gData.specNames)}
								</Text>
								:null
							}
						</View>
						<View style={[styles.goods_price]}>
							<Text style={styles.right_text}>￥{gData.shopPrice}</Text>
							<Text style={styles.right_text}>x {gData.cartNum}</Text>
						</View>
				</View>
				{
					this.state['goods_flag_'+gData.goodsId]!=undefined
					?
					<View style={[styles.cannot_delivery,styles.center]}>
						<Text style={{fontSize:14,color:'red'}}>该商品不在配送区域内!</Text>
					</View>
					:
					null
				}

			   </View>
			);
		}
		return code;
	}
	// 渲染商品规格
	renderSpec(data){
		let code = [];
		for(let i in data){
			code.push(<Text key={i}>{data[i].catName}:{data[i].itemName}</Text>);
		}
		return code;
	}
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return Utils.loading();
		}
		return(
			<View style={styles.contrainer}>
				 {/* 头部 */}
				 <Header initObj={{backName:' ',title:'确认订单'}} backEvent={()=>this.props.backEvent()}/>
				 <ScrollView style={styles.main}>
				 	{/* 收货地址 */}
				 	<TouchableOpacity style={[styles.address,styles.row,styles.center]} onPress={()=>this.goToAddress()}>
				 		{this.renderAddress()}
				 		<Icon name={'keyboard-arrow-right'} size={23} />
				 	</TouchableOpacity>
				 	{/* 店铺订单结算 */}
				 	{this.renderShopItem()}
				 	
				 	{/* 其余订单信息 */}
				 	<View style={styles.order_set}>
				 		{/*支付方式*/}
					 	<TouchableOpacity style={[styles.row,styles.order_set_item]} onPress={()=>this.showPopup('pay')}>
					 		<Text style={styles.order_set_text}>支付方式</Text>
					 		<View style={[styles.row,styles.center]}>
					 			<Text>{this.state.payName}</Text>
					 			<Icon name={'keyboard-arrow-right'} size={23} />
					 		</View>
					 	</TouchableOpacity>

					 	{/*配送方式*/}
					 	<TouchableOpacity style={[styles.row,styles.order_set_item]} onPress={()=>deliver.setState({isShow:true})}>
					 		<Text style={styles.order_set_text}>配送方式</Text>
					 		<View style={[styles.row,styles.center]}>
					 			<Text>{this.state.deliverName}</Text>
					 			<Icon name={'keyboard-arrow-right'} size={23} />
					 		</View>
					 	</TouchableOpacity>
					 	{/*发票信息*/}
					 	{/*<TouchableOpacity style={[styles.row,styles.order_set_item]} onPress={()=>invoice.setState({isShow:true})}>
					 		<Text style={styles.order_set_text}>发票信息</Text>
					 		<View style={[styles.row,styles.center]}>
					 			<Text>{this.state.invoiceName}</Text>
					 			<Icon name={'keyboard-arrow-right'} size={23} />
					 		</View>
					 	</TouchableOpacity>*/}
					 	{/*积分支付*/}
					 	{
					 		(data.isOpenScorePay==1)
					 		?
					 		<TouchableOpacity style={[styles.row,styles.order_set_item]} onPress={()=>score.setState({isShow:true})}>
					 		<Text style={styles.order_set_text}>积分支付</Text>
					 		<View style={[styles.row,styles.center]}>
					 			<Text>{this.state.scoreName}</Text>
					 			<Icon name={'keyboard-arrow-right'} size={23} />
					 		</View>
					 		</TouchableOpacity>
					 		:
					 		null
					 	}
					 	
					 </View>
				 </ScrollView>
				 {/* 顶部弹出层 */}
				 <Popup ref={(a)=>{pay=a;}} isShare={data.isShare}  data={data.payments} type='pay' commit={this.commitChose} />

				 <Deliver ref={(b)=>{deliver=b;}}  type='deliver' commit={this.commitChose} />
				 
				 <Invoice ref={(c)=>{invoice=c;}}   type='invoice' commit={this.commitChose} />
				 {/* 是否加载积分层 */}
				 {
			 		(data.isOpenScorePay==1)
			 		?
				 	<Score ref={(d)=>{score=d;}}   type='score' commit={this.commitChose} useScore={this.state.userOrderScore} scoreMoney={this.state.userOrderMoney} />
				 	:
				 	null
				 }

				 <Bottom goodsTotalMoney={this.state.totalMoney} orderSubmit={this.orderSubmit} />
				{/* 请稍等... */}
				<Requesting ref="requesting" msg={'请稍等···'} />
			</View>
		);
	}
}
const styles = StyleSheet.create({
	contrainer:{
		flex:1,
		backgroundColor:'#dedede',
	},
	flex_1:{flex:1},
	row:{flexDirection:'row'},
	center:{justifyContent:'center',alignItems:'center'},
	red:{color:'#de0202'},
	// 主体内容
	main:{
		height:height-50,
		backgroundColor:'#f6f6f8',
	},
	address:{
		marginTop:5,
		height:height*0.10,
		backgroundColor:'#fff',
		paddingLeft:10,
	},
	shop_name:{
		paddingTop:5
	},
	// 店铺订单
	order_item:{
		marginTop:5,
		backgroundColor:'#fff',
		padding:10,
		paddingTop:0,
	},
	// 商品列表
	goods_list:{

	},
	goods_item:{
		paddingTop:5,
		paddingBottom:5,
		borderBottomWidth:1,
		borderBottomColor:'#ccc'
	},
	goods_img:{
		marginRight:5,
		width:height*0.13,
		height:height*0.13,
	},
	goods_info:{
		flex:3,
	},
	goods_price:{
		width:width*0.2,
	},
	goods_text:{
		fontSize:15,
	},
	goods_spec:{
		fontSize:13,
		color:'#a6a6a6'
	},
	right_text:{
		alignSelf:'flex-end'
	},
	// 运费合计
	item:{
		marginTop:5,
		justifyContent:'space-between',
		alignItems:'center',
	},
	remarks:{
		borderWidth:1,
		borderColor:'#ccc',
		marginTop:10,
		height:40,
	},
	// 其余订单信息
	order_set:{
		marginTop:5,
		marginBottom:5,
		backgroundColor:'#fff',
		padding:10,
		paddingTop:0,
		paddingRight:0
	},
	order_set_text:{
		fontSize:16,
	},
	order_set_item:{
		marginTop:5,
		paddingBottom:5,
		justifyContent:'space-between',
		alignItems:'center',
		borderBottomWidth:1,
		borderBottomColor:'#f1f1f1'
	},
	cannot_delivery:{
		position:'absolute',
		width:'100%',
		height:'100%',
		backgroundColor:'rgba(0,0,0,0.5)'
	}

});