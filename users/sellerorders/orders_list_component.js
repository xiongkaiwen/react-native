/**
* 待支付订单列表
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
  Picker,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons'
//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
// 按钮组件
import Button from './../../common/button';
// 订单详情页
import OrderDetail from './../orders/orders_detail';

// 兼容ios下拉框
import ModalDropdown from 'react-native-modal-dropdown';


// 域名,用于显示图片
var domain;
export default class orderList extends Component{
	constructor(props){
		super(props);
		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 订单数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
		this.state = {};
		// 是否有网络
		this.state.isConnected = true;
		this.state.ds = ds; // dataSource对象
		this.state.isRefreshing = false; // 刷新中

		this.state.loading = true;// 请求数据中
		this.state.hasData = false; // 是否有数据
		// 绑定this
		this._onDataArrived = this._onDataArrived.bind(this);
		this.getData = this.getData.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.viewOrderDetail = this.viewOrderDetail.bind(this);



		/***********************  订单操作 *****************************/
		// 新订单价格
		this.state.newOrderPrice = 0;
		// 各种理由
		this.express,this.refundReason;
		// 用于执行订单操作
		this.state.orderId = 0;
		this.state.expressId = 0;// 快递Id
		this.state.expressNo = '';// 快递单号
		this.state.refundReason = 0;// 退款操作理由id
		// 修改订单价格对话框
		this.state.editPriceShow = false;

		// 发货对话框
		this.state.deliveryShow = false;
		this.state.deliveryShow1 = false;
		// 退款操作对话框
		this.state.refundShow = false;
		this.state.refundRemark = ''; // 商家不同意退款的备注
		this.state.agree = 1; // 同意按钮默认为同意
		// 退款信息
		this.state.refundId = 0;
		this.state.orderNo = 0;
		this.state.realTotalMoney = 0;
		this.state.backMoney = 0;
		this.state.useScore = 0;
		this.state.scoreMoney = 0;


		// 绑定this
		this.showDialog = this.showDialog.bind(this);
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
	/************************************************* 订单操作start **************************************************************/
	// 快递公司
	renderExpress(){
		let code = [];
		code.push(<Picker.Item key={'001'} label="请选择" value="0" />)
		for(let i in this.express){
			let reason = this.express[i];
			code.push(
				<Picker.Item key={i} label={reason.expressName} value={reason.expressId} />
			);
		}
		return code;
	}
	/*************************************兼容ios******************************/
	renderIosReasonData(){
		let options = [];
		this.expressData = [];
		for(let i in this.express){
			let reason = this.express[i];
			options.push(reason.expressName);
			this.expressData.push({
				[reason.expressName]:reason.expressId,
			});
		}
		return options;
	}
	iosSelected(rowData){
		let that = this;
		let val = 0;
		this.expressData.map((item, index, data)=>{
			if(item[rowData])val=item[rowData];
		});
		this.setState({expressId: val});
	}
	/*************************************兼容ios end******************************/

	/* 显示对话框
	*  deliverType:1-自提 0-快递运输
	*
	*/
	showDialog(dialog, orderId, deliverType){
		let dialogName =(deliverType && dialog=='delivery')?dialog+'Show1':dialog+'Show';
		let obj = {};
		obj[dialogName] = true;
		obj.orderId = orderId;
		this.setState(obj);
	}
	// 执行订单价格
	editOrderPrice(){
		let that = this;
		let postData = {
			tokenId:global.tokenId,
			id:that.state.orderId,
			orderMoney:that.state.newOrderPrice,
		};
		// 请求修改订单价格接口
		let url = Utils.domain+'app/orders/editOrderMoney';
		Utils.post(
				   url,
				   postData,
				   function(editRespon){
				   		Utils.msg(editRespon.msg,'top');
				   		if(editRespon.status==1){
				   			// 刷新当前页
				   			that._onRefresh();
				   			// 关闭对话框
				   			that.setState({
				   				orderId:0,
				   				editPriceShow:false,
				   			});
				   		}
				   },
				   function(err){
				   		console.log(err);
				   		that.setState({editPriceShow:false});
				   });
	}
	// 执行发货
	deliverOrder(){
		let that = this;
		let postData = {
			tokenId:global.tokenId,
			id:that.state.orderId,
			expressId:that.state.expressId,
			expressNo:that.state.expressNo,
		};
		// 请求订单发货接口
		let url = Utils.domain+'app/orders/deliver';
		Utils.post(
				   url,
				   postData,
				   function(deliveryRespon){
				   		Utils.msg(deliveryRespon.msg,'top');
				   		if(deliveryRespon.status==1){
				   			// 刷新当前页
				   			that._onRefresh();
				   			// 关闭对话框、并重置
				   			that.setState({
				   				orderId:0,
				   				deliveryShow:false,
				   				deliveryShow1:false,
				   				expressId:'0',
				   			});
				   		}
				   },
				   function(err){
				   		that.setState({deliveryShow:false});
				   });
	}
	// 显示退款对话框,及退款信息
	showRefundDialog(refundId){
		let that = this;
		// 请求接口获取订单退款信息
		let url = Utils.domain+'app/orders/toShopRefund';
		let postData = {
			tokenId:global.tokenId,
			id:refundId
		}
		Utils.post(
				   url,
				   postData,
				   function(refundInfo){
				   		/*orderNo
						realTotalMoney
						backMoney
						useScore
						scoreMoney*/

				   		if(refundInfo.status==1){
				   			let obj = {};
				   			obj.refundId = refundId;
				   			obj.orderNo = refundInfo.data.orderNo;
							obj.realTotalMoney = refundInfo.data.realTotalMoney;
							obj.backMoney = refundInfo.data.backMoney;
							obj.useScore = refundInfo.data.useScore;
							obj.scoreMoney = refundInfo.data.scoreMoney;
							// 设置退款信息
							that.setState(obj);
							// 显示对话框	
							that.showDialog('refund',refundInfo.data.orderId);
				   		}
				   },
				   function(err){
				   		console.log('请求退款信息出错',err);
				   });
	}

	// 执行退款操作
	refundOrder(){
		let that = this;
		if(that.state.agree==-1 && that.state.refundRemark==''){
			Utils.msg('请输入原因','top');
			return;
		}
		/*
			id  退款表id
			refundStatus  是否同意退款
			content  拒绝退款说明
		*/
		let postData = {
			tokenId:global.tokenId,
			id:that.state.refundId,
			refundStatus:that.state.agree,
			content:that.state.refundRemark,
		};
		// 请求商家处理退款接口
		let url = Utils.domain+'app/orderrefunds/shopRefund';
		Utils.post(
				   url,
				   postData,
				   function(refundRespon){
				   		Utils.msg(refundRespon.msg,'top');
				   		if(refundRespon.status==1){
				   			// 刷新当前页
				   			that._onRefresh();
				   			// 关闭对话框、并重置
				   			that.setState({
				   				refundId:0,
				   				refundShow:false,
				   				agree:1,
				   				refundRemark:'',
								useScore:0,
								scoreMoney:0,
								orderNo:0,
								realTotalMoney:0,
								backMoney:0,
				   			});
				   		}
				   },
				   function(err){
				   		console.log(err);
				   		that.setState({refundShow:false});
				   });
	}

	/************************************************* 订单操作end **************************************************************/

	// 获取订单数据
	// 请求数据
	getData(){
		let that = this;
		// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;
		// 请求接口
		let url = Utils.domain+'app/orders/getSellerOrderList';
		let postData = {
			tokenId:global.tokenId,
			page:that.currPage+1, // 当前请求的页数
			type:that.props.type,
			payType:-1,
			deliverType:-1,
		};
		Utils.post(
					url,
					postData,
					function(responData){
						if(responData.status==1){
							let orderData = responData.data;
							// 域名
							domain = orderData.domain;
							// 总页数
							that.totalPage = parseInt(orderData.TotalPage,10);
							// 当前页
							that.currPage = parseInt(orderData.CurrentPage,10);
							// 订单数据
							let orders = orderData.Rows;
							that._data = that._data.concat(orders);
							// 更新ds
							// 获取到的订单数据 传递给__renderRow
							that._onDataArrived(that._data);
							// 快递公司
							that.express = orderData.express;
							that.refundReason = orderData.refundReason;


							// 关闭loading、Refreshing
							that.setState({
								loading:false,
								isRefreshing:false,
								hasData:true,
							});
						}else{
							Utils.msg(responData.msg);
							that.setState({
								loading:false,
								hasData:false,
							});
						}
					},
					function(err){
						console.log('商家订单列表出错',err);
						// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}
					});
	}
	// 设置dataSource
	_onDataArrived(newData){
	  this.setState({
	    ds: this.state.ds.cloneWithRows(newData),
	    loading:false,
	  });
	};
	// 执行顶部下拉刷新
	_onRefresh(){
		// 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
			if(isConnected || global._platfrom=='ios'){
			    // 重置rowData
				this._data = [];
				// 将当前页置为1
				this.currPage = 0;
				// 开启Refreshing
				this.setState({
					isConnected:true,
					isRefreshing:true,
				});
				// 调用接口重新请求数据
				this.getData();
			}else{
			  // 当前无网络连接
			  this.setState({
				isConnected:false,
			  });
			}
		});



		
	}
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(rowData){
		return(
	      	<TouchableOpacity activeOpacity={0.8} style={styles.order_item} onPress={()=>this.viewOrderDetail(rowData.orderId)}>
		      	<View style={[styles.row,styles.order_head]}>
		      		<Text style={styles.c13_333}>订单号：{rowData.orderNo}</Text>
		      		<Text style={styles.red}>{rowData.status}</Text>
		      	</View>
	      		<View style={styles.order_goods_list}>
	      			{this.renderOrderGoods(rowData.list)}
	      		</View>
	      		<View style={[styles.row,styles.order_price]}>
	      			<Text style={styles.c13_333}>
	      				订单总价:<Text style={[styles.red,{fontSize:13}]}>￥{rowData.realTotalMoney}</Text>
	      			</Text>
	      		</View>
	      		<View style={[styles.row,styles.order_btn_box]}>
	      			{
	      				(rowData.orderStatus==-2)?
				 		<Button 
				 		onPress={()=>this.showDialog('editPrice', rowData.orderId)} 
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'修改价格'}/>
				 		:
				 		null
	      			}

				 	{
	      				(rowData.orderStatus==0)?
	      				<Button 
				 		onPress={()=>this.showDialog('delivery', rowData.orderId, rowData.deliverType)} 
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'发货'}/>
	      				:
	      				null
	      			}

	      			{	
	      				(rowData.payType==1 && rowData.refundId )?
				 		<Button 
				 		onPress={()=>this.showRefundDialog(rowData.refundId)} 
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'退款操作'}/>
				 		:
				 		null
	      			}

				 	
	      		</View>
	      	</TouchableOpacity>
		);
	}
	renderOrderGoods(goodsData){
		let code = [];
		for(let i in goodsData){
			let goods = goodsData[i];
			code.push(
				<View key={goods.goodsId} style={[styles.goods_item,styles.row]}>
      				<Image source={{uri:domain+goods.goodsImg}} style={styles.goods_img} />
      				<Text style={[styles.goods_name,styles.c13_333]}>{goods.goodsName}</Text>
      				<Text style={[styles.goods_price_num,styles.c13_333]}>￥{goods.shopPrice} x{goods.goodsNum}</Text>
      			</View>
			);
		}
		return code;
	}

	// 进入订单详情页
	viewOrderDetail(orderId){
		this.props.navigator.push({
			component:OrderDetail,
			passProps:{
				orderId:orderId,
				isShop:1
			}
		});
	}
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return Utils.loading();
		}
		if(!this.state.hasData){
			return (
				<View style={[styles.flex_1,styles.center]}>
					<Image source={require('./../../img/order_empty.png')} style={{width:width*0.251,height:width*0.251}} />
					<Text style={styles.text}>
						您暂时还没有相关订单
					</Text>
				</View>
				);
		}
		return(
			  <View style={styles.flex_1}>
			      <ListView
			      	tabLabel='全部'
					onEndReachedThreshold={50} 
					onEndReached ={this.getData}
					style={styles.contrainer}
					dataSource={this.state.ds}
					renderRow={this._renderRow}
					refreshControl={ 
			          <RefreshControl
			            refreshing={this.state.isRefreshing}
			            onRefresh={this._onRefresh}
			            colors={['#00ff00', '#ff0000', '#0000ff']}/> 
			        }/>
			        {/* 各种对话框 */}
					{/* 修改价格对话框 */}
					<Modal
					  animationType={"fade"}
			          transparent={true}
			          visible={this.state.editPriceShow}
			          onRequestClose={() => {console.log("Modal has been closed.")}}>
						<View style={[styles.flex_1,styles.center,styles.modal]}>
							<View style={styles.dialog}>
								<View style={[styles.center]}>
								</View>
								{/* 内容 */}
								<View style={[styles.dialog_main,styles.center,styles.row]}>
										<Text>新价格：</Text>
										<View style={styles.dialog_add}>
										<TextInput 
											keyboardType={'numeric'}
											width={width*0.4}
											height={40}
											underlineColorAndroid="transparent"
											onChangeText={(val)=>this.setState({newOrderPrice:val})} />
										</View>
								</View>
								{/* 按钮 */}
								<View style={[styles.row,styles.center,styles.modal_btn_box]}>
									<Button 
							 		onPress={()=>this.setState({editPriceShow:false})} 
							 		style={[styles.modal_btn,styles.modal_bad_btn,styles.center]} 
							 		textStyle={[styles.bad_btn_text]} text={'取消'}/>

							 		<Button 
							 		onPress={()=>this.editOrderPrice()} 
							 		style={[styles.modal_btn,styles.modal_good_btn,styles.center]} 
							 		textStyle={[styles.good_btn_text]} text={'确定'}/>
								</View>
							</View>
						</View>
					</Modal>

					{/* 发货对话框 */}
					<Modal
					  animationType={"fade"}
			          transparent={true}
			          visible={this.state.deliveryShow}
			          onRequestClose={() => {console.log("Modal has been closed.")}}>
						<View style={[styles.flex_1,styles.center,styles.modal]}>
							<View style={styles.dialog}>
								<View style={[styles.center]}>
								</View>
								{/* 内容 */}
								<View style={[styles.dialog_main,styles.center]}>
								    <View style={[styles.row,styles.center]}>
										<Text>快递公司：</Text>
										<View style={styles.selecte}>
											{
											global._platfrom=='ios'
											?
											<ModalDropdown 
												dropdownStyle={{width:width*0.3}}
												textStyle={styles.ios_select_text}
												defaultValue={'请选择'}
												style={styles.ios_select}
				                                onSelect={(rowId,rowData)=>this.iosSelected(rowData)}
				                                options={this.renderIosReasonData()}/>
											:
											<Picker
											  style={{height:40,}}
											  mode={'dropdown'}
											  selectedValue={this.state.expressId}
											  onValueChange={(val) => this.setState({expressId: val})}>
											  {this.renderExpress()}
											</Picker>
											}
										</View>
									</View>
									<View style={[styles.row,styles.center,{marginTop:5}]}>
										<Text>快递单号：</Text>
										<View style={styles.dialog_add}>
											<TextInput 
												keyboardType={'numeric'}
												width={width*0.5}
												height={40}
												underlineColorAndroid="transparent"
												onChangeText={(val)=>this.setState({expressNo:val})} />
										</View>
									</View>

								</View>
								{/* 按钮 */}
								<View style={[styles.row,styles.center,styles.modal_btn_box]}>
									<Button 
							 		onPress={()=>this.setState({deliveryShow:false})} 
							 		style={[styles.modal_btn,styles.modal_bad_btn,styles.center]} 
							 		textStyle={[styles.bad_btn_text]} text={'取消'}/>

							 		<Button 
							 		onPress={()=>this.deliverOrder()} 
							 		style={[styles.modal_btn,styles.modal_good_btn,styles.center]} 
							 		textStyle={[styles.good_btn_text]} text={'确定'}/>
								</View>
							</View>
						</View>
					</Modal>
					{/* 确认发货对话框 */}
					<Modal
					  animationType={"fade"}
			          transparent={true}
			          visible={this.state.deliveryShow1}
			          onRequestClose={() => {console.log("Modal has been closed.")}}>
						<View style={[styles.flex_1,styles.center,styles.modal]}>
							<View style={styles.dialog}>
								<View style={[styles.center]}>
								</View>
								{/* 内容 */}
								<View style={[styles.dialog_main,styles.center,styles.row]}>
										<View>
											<Text>你确定发货吗?</Text>
											<View style={{borderWidth:1,borderColor:'#dddddd',marginTop:10}}>
											</View>
										</View>
								</View>
								{/* 按钮 */}
								<View style={[styles.row,styles.center,styles.modal_btn_box]}>
									<Button 
							 		onPress={()=>this.setState({deliveryShow1:false})} 
							 		style={[styles.modal_btn,styles.modal_bad_btn,styles.center]} 
							 		textStyle={[styles.bad_btn_text]} text={'取消'}/>

							 		<Button 
							 		onPress={()=>this.deliverOrder()} 
							 		style={[styles.modal_btn,styles.modal_good_btn,styles.center]} 
							 		textStyle={[styles.good_btn_text]} text={'确定'}/>
								</View>
							</View>
						</View>
					</Modal>


					{/* 退款操作对话框 */}
					<Modal
					  animationType={"fade"}
			          transparent={true}
			          visible={this.state.refundShow}
			          onRequestClose={() => {console.log("Modal has been closed.")}}>
						<View style={[styles.flex_1,styles.center,styles.modal]}>
							<View style={styles.dialog}>
								<View style={[styles.center]}>
								</View>

								{/* 内容 */}
								<View style={[{paddingLeft:width*0.11},styles.dialog_main]}>
								    <View style={[styles.row,styles.refund_item]}>
										<Text>订单号：</Text>
										<Text>{this.state.orderNo}</Text>
									</View>
									<View style={[styles.row,styles.refund_item]}>
										<Text>实付金额：</Text>
										<Text>￥{this.state.realTotalMoney}</Text>
									</View>
									<View style={[styles.row,styles.refund_item]}>
										<Text>退款金额：</Text>
										<Text style={styles.red}>￥{this.state.backMoney}</Text>
									</View>
									<View style={[styles.row,styles.refund_item]}>
										<Text>退款积分：</Text>
										<Text style={styles.red}>
										{this.state.useScore}个(积分抵扣￥{this.state.scoreMoney})
										</Text>
									</View>
									<View style={[styles.row,styles.refund_item]}>
										<Text>商家意见：</Text>
										<View style={[styles.row,]}>
											<View style={[styles.row,styles.center]}>
												{
													(this.state.agree==1)
													?
													<Icon name={'radio-button-checked'} size={15} color={'red'} />
													:
													<Icon onPress={()=>this.setState({agree:1})} name={'radio-button-unchecked'} size={15} />
												}
												<Text>同意</Text>
											</View>

											<View style={[styles.row,styles.center,{marginLeft:5}]}>
												{
													(this.state.agree==-1)
													?
													<Icon name={'radio-button-checked'} size={15} color={'red'} />
													:
													<Icon onPress={()=>this.setState({agree:-1})} name={'radio-button-unchecked'} size={15} />
												}
												<Text>不同意</Text>
											</View>
										</View>
									</View>
									{
										(this.state.agree==-1)
										?
										<View>
											<Text>原因：</Text>
											<View style={{borderWidth:1,borderColor:'#ccc',marginRight:width*0.1}}>
											<TextInput 
												style={{textAlignVertical:'top',height:50}}
												multiline={true}
												underlineColorAndroid="transparent"
												onChangeText={(val)=>this.setState({refundRemark:val})}/>
											</View>
										</View>
										:
										null
									}
								</View>
								{/* 按钮 */}
								<View style={[styles.row,styles.center,styles.modal_btn_box]}>
									<Button 
							 		onPress={()=>this.setState({refundShow:false})} 
							 		style={[styles.modal_btn,styles.modal_bad_btn,styles.center]} 
							 		textStyle={[styles.bad_btn_text]} text={'取消'}/>

							 		<Button 
							 		onPress={()=>this.refundOrder()} 
							 		style={[styles.modal_btn,styles.modal_good_btn,styles.center]} 
							 		textStyle={[styles.good_btn_text]} text={'确定'}/>
								</View>
							</View>
						</View>
					</Modal>

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
		color:'#d82a2e',
		fontSize:11
	},
	text:{
		marginTop:10,
		fontSize:16,
		color:'#e82a2e',
	},
	row:{flexDirection:'row'},
	c13_333:{
		fontSize:13,
		color:'#333'
	},
	c11_999:{
		fontSize:11,
		color:'#999'
	},
	// 订单item
	order_item:{
		marginTop:10,
		backgroundColor:'#fff'
	},
	order_head:{
		justifyContent:'space-between',
		padding:10,
	},
	// 订单下的商品列表
	order_goods_list:{
	},
	goods_item:{
		paddingLeft:10,
		paddingRight:10,
		paddingBottom:5,
		paddingTop:5,
		borderBottomWidth:1,
		borderBottomColor:'#eee',
	},
	goods_name:{
		flex:3,
		paddingLeft:10,
	},
	goods_price_num:{
		width:width*0.2,
		textAlign:'right'
	},
	goods_img:{
		width:width*0.213,
		height:width*0.213,
	},
	order_price:{
		padding:5,
		justifyContent:'flex-end',
		alignItems:'center',
	},
	// 订单底部按钮
	order_btn_box:{
		padding:5,
		paddingRight:15,
		justifyContent:'flex-end',
		alignItems:'center',
	},
	order_btn:{
		padding:10,
		paddingTop:5,
		paddingBottom:5,
		borderWidth:1,
		borderRadius:15,
		backgroundColor:'#fff',
		marginLeft:5,
	},
	bad_btn:{
		borderColor:'#333',
	},
	good_btn:{
		borderColor:'#d82a2e',
	},
	btn_text:{
		fontSize:11,
		color:'#333'
	},
	// dialog
	modal:{
		backgroundColor:'rgba(0,0,0,0.1)'
	},
	dialog:{
		width:width*0.8,
		padding:10,
		backgroundColor:'#fff',
		borderRadius:10,
	},
	dialog_main:{
		marginTop:10,
		marginBottom:10,
		minHeight:height*0.1,
	},
	modal_btn:{
		padding:20,
		paddingTop:5,
		paddingBottom:5,
		borderWidth:1,
		borderRadius:5,
		backgroundColor:'#fff',
		marginLeft:5,
	},
	modal_bad_btn:{
		borderColor:'#cacccd',
		backgroundColor:'#fdfdfd'
	},
	modal_good_btn:{
		borderColor:'#de0202',
		backgroundColor:'#de0202',
	},
	good_btn_text:{
		color:'#fff'
	},
	//  下拉框
	selecte:{
		borderWidth:1,
		borderColor:'#ccc',
		width:width*0.5
	},
	// 补充内容
	dialog_add:{
		height:40,
		borderWidth:1,
		borderColor:'#ccc'
	},
	refund_item:{
		marginBottom:5
	},
	// 兼容ios下拉框样式
	ios_select:{
		height:30,
		justifyContent:'center'
	},
	ios_select_text:{
		fontSize:15
	},
});