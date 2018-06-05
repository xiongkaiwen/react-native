/**
* 待支付订单列表
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  Picker,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Image,
  NetInfo,
  InteractionManager
} from 'react-native';
// modal组件
import Modal from 'react-native-root-modal';
// 显示刷新页面
import Refresh from './../../common/refresh';
//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
// 按钮组件
import Button from './../../common/button';

// 订单详情页
import OrderDetail from './orders_detail';
// 订单评价页
import OrderAppraises from './orders_appraises'
// 订单投诉页
import OrderComplain from './orders_complaint';
// 支付方式
import PayType from './paytype';
// 兼容ios下拉框
import ModalDropdown from 'react-native-modal-dropdown';


/******************************** 插件 *************************************/
// 物流插件
import {Logistics} from 'wst-plug';
/*********************************************************************/

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
		// 各种理由
		this.cancelReason,this.rejectReason,this.refundReason;
		// 确认收货对话框
		this.state.receiveShow = false;
		// 用于执行订单操作
		this.state.orderId = 0;
		this.state.cancelReason = 0; // 取消订单理由id
		this.state.rejectReason = 0;// 拒收订单理由id
		this.state.refundReason = 0;// 退款操作理由id
		// 取消订单对话框
		this.state.cancelShow = false;
		// 拒收订单对话框
		this.state.rejectShow = false;
		this.state.rejectRemark = ''; // 拒收订单选'其他'的备注
		// 退款操作对话框
		this.state.refundShow = false;
		this.state.refundRemark = ''; // 退款操作选'其他'的备注
			// 退款信息
		this.state.canRefundMoney = 0;// 可退款金额
		this.state.useScore = 0;// 使用的积分
		this.state.scoreMoney = 0;// 积分抵消金额


		this.state.refundMoney = 0; //  用户输入的退款金额
		// 绑定this
		this.showDialog = this.showDialog.bind(this);
		this.renderIosReasonData = this.renderIosReasonData.bind(this);
		this.iosSelected = this.iosSelected.bind(this);
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
	// 组件接收新属性
	componentWillReceiveProps(nextProps){
		console.log('1.接收到新属性');
		//this._onRefresh();
	}
	/************************************************* 订单操作start **************************************************************/
	// 订单操作数据
	renderReasonData(type){
		let reasonName = type+'Reason';
		let code = [];
		code.push(<Picker.Item key={'001'} label="请选择" value="0" />)
		for(let i in this[reasonName]){
			let reason = this[reasonName][i];
			code.push(
				<Picker.Item key={i} label={reason.dataName} value={reason.dataVal} />
			);
		}
		return code;
	}
	/*************************************兼容ios******************************/
	renderIosReasonData(type){
		let reasonName = type+'Reason';
		let options = [];

		let _reasonArr = type+'_ios';

		this[_reasonArr] = [];
		for(let i in this[reasonName]){
			let reason = this[reasonName][i];
			options.push(reason.dataName);
			this[_reasonArr].push({
				[reason.dataName]:reason.dataVal,
			});
		}
		return options;
	}
	iosSelected(rowData){
		let that = this;
		let reasonName = this.currDialog+'Reason';
		let _reasonArr = this.currDialog+'_ios';
		let val = 0;
		this[_reasonArr].map((item, index, data)=>{
			if(item[rowData])val=item[rowData];
		});
		let obj = {};
		obj[reasonName] = val;
		this.setState(obj);
	}
	/*************************************兼容ios end******************************/

	// 显示对话框
	showDialog(dialog, orderId){
		let dialogName = dialog+'Show';
		let reasonName = dialog+'Reason';
		this.currDialog = dialog;
		let obj = {};
		obj[dialogName] = true;
		obj.orderId = orderId;
		obj[reasonName] = 0;
		this.setState(obj);
	}
	// 执行确认收货
	receive(){
		let that = this;
		let url = Utils.domain+'app/orders/receive';
		let postData = {
			tokenId:global.tokenId,
			orderId:this.state.orderId
		}
		Utils.post(
				   url,
				   postData,
				   function(receiveRespon){
				   		Utils.msg(receiveRespon.msg);	
				   		if(receiveRespon.status){
				   			// 刷新当前页
				   			that._onRefresh();
				   			// 关闭对话框
				   			that.setState({
				   				orderId:0,
				   				receiveShow:false,
				   			});
				   		}
				   },
				   function(err){
				   		console.log('确认收货失败,',err);
				   });
	}
	// 执行取消订单
	cancelOrder(){
		let that = this;
		if(that.state.cancelReason==0){
			Utils.msg('请选择你取消订单的原因','top');
			return;
		}
		let postData = {
			tokenId:global.tokenId,
			id:that.state.orderId,
			reason:that.state.cancelReason,
		};
		// 请求取消订单接口
		let url = Utils.domain+'app/orders/cancellation';
		Utils.post(
				   url,
				   postData,
				   function(cancalRespon){
				   		Utils.msg(cancalRespon.msg,'center');
				   		if(cancalRespon.status==1){
				   			// 刷新当前页
				   			that._onRefresh();
				   			// 关闭对话框
				   			that.setState({
				   				orderId:0,
				   				cancelShow:false,
				   				cancelReason:'0'
				   			});
				   		}
				   },
				   function(err){
				   		console.log(err);
				   		that.setState({cancelShow:false});
				   });
	}
	// 执行拒收订单
	rejectOrder(){
		let that = this;
		if(that.state.rejectReason==0){
			Utils.msg('请选择你拒收订单的原因','top');
			return;
		}
		if(that.state.rejectReason==10000 && that.state.rejectRemark==''){
			Utils.msg('请输入拒收原因','top');
			return;
		}
		let postData = {
			tokenId:global.tokenId,
			id:that.state.orderId,
			reason:that.state.rejectReason,
			content:that.state.rejectRemark
		};
		// 请求拒收订单接口
		let url = Utils.domain+'app/orders/reject';
		Utils.post(
				   url,
				   postData,
				   function(rejectRespon){
				   		Utils.msg(rejectRespon.msg,'center');
				   		if(rejectRespon.status==1){
				   			// 刷新当前页
				   			that._onRefresh();
				   			// 关闭对话框、并重置
				   			that.setState({
				   				orderId:0,
				   				rejectShow:false,
				   				rejectReason:'0',
				   				rejectRemark:''
				   			});
				   		}
				   },
				   function(err){
				   		that.setState({rejectShow:false});
				   });
	}
	// 显示退款对话框,及可退款信息
	showRefundDialog(orderId){
		let that = this;
		// 请求接口获取订单退款信息
		let url = Utils.domain+'app/orders/getRefund';
		let postData = {
			tokenId:global.tokenId,
			id:orderId
		}
		Utils.post(
				   url,
				   postData,
				   function(refundInfo){
				   		if(refundInfo.status==1){
				   			let data = refundInfo.data;
				   			let refundObj = {
				   				canRefundMoney:data.realTotalMoney, // 可退款金额
				   				useScore:data.useScore, 			// 使用的积分
				   				scoreMoney:data.scoreMoney, 		// 积分抵消金额
				   			};
							// 设置退款信息
							that.setState(refundObj);
							// 显示对话框			
							that.showDialog('refund',orderId);
				   		}
				   },
				   function(err){
				   		console.log('请求退款信息出错',err);
				   });
	}

	// 执行退款操作
	refundOrder(){
		let that = this;
		if(that.state.refundReason==0){
			Utils.msg('请选择你退款的原因','top');
			return;
		}
		if(that.state.refundReason==10000 && that.state.refundRemark==''){
			Utils.msg('请输入退款原因','top');
			return;
		}
		if(that.state.refundMoney<0){
			Utils.msg('请输入退款金额','top');
			return;
		}
		if(that.state.refundMoney > that.state.canRefundMoney){
			Utils.msg('申请退款金额不能大于实支付金额','top');
			return;
		}
		let postData = {
			tokenId:global.tokenId,
			id:that.state.orderId,
			reason:that.state.refundReason,
			content:that.state.refundRemark,
			money:that.state.refundMoney
		};
		// 请求退款接口
		let url = Utils.domain+'app/orderrefunds/refund';
		Utils.post(
				   url,
				   postData,
				   function(refundRespon){
				   		Utils.msg(refundRespon.msg,'center');
				   		if(refundRespon.status==1){
				   			// 刷新当前页
				   			that._onRefresh();
				   			// 关闭对话框、并重置
				   			that.setState({
				   				orderId:0,
				   				refundShow:false,
				   				refundReason:'0',
				   				refundRemark:'',
				   				canRefundMoney:0,
								useScore:0,
								scoreMoney:0
				   			});
				   		}
				   },
				   function(err){
				   		that.setState({rejectShow:false});
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
		let url = Utils.domain+'app/orders/getOrderList';
		let postData = {
			tokenId:global.tokenId,
			page:that.currPage+1, // 当前请求的页数
			type:that.props.type
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
							// 各种理由
							that.cancelReason = orderData.cancelReason;
							that.rejectReason = orderData.rejectReason;
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
						console.log('订单列表错误',err);
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
		      		<View style={styles.row}>
			      		<Image source={require('./../../img/order_shop.png')} resizeMode={'cover'} style={{width:18,height:18*0.9,marginRight:5,}} />
			      		<Text style={styles.c13_333}>
			      			{rowData.shopName}
			      		</Text>
		      		</View>
		      		<Text style={[styles.red,styles.order_status]}>{rowData.status}</Text>
		      	</View>
	      		<View style={styles.order_goods_list}>
	      			{this.renderOrderGoods(rowData.list)}
	      		</View>
	      		<View style={[styles.row,styles.order_price]}>
	      			<Text style={[styles.c11_999,{marginRight:5}]}>共{rowData.list.length}件商品</Text>
	      			<Text style={styles.c13_333}>
	      				实付:￥{rowData.realTotalMoney}
	      			</Text>
	      		</View>
	      		<View style={[styles.row,styles.order_btn_box]}>
	      			{
	      				(rowData.orderStatus==-2)?
				 		<Button 
				 		onPress={()=>this.toPay(rowData.orderNo)} 
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'立即付款'}/>
				 		:
				 		null
	      			}

				 	{
				 		(rowData.orderStatus==0 || rowData.orderStatus==-2)?
				 		<Button 
				 		onPress={()=>this.showDialog('cancel', rowData.orderId)} 
				 		style={[styles.order_btn,styles.bad_btn,styles.center]} 
				 		textStyle={[styles.btn_text]} text={'取消订单'}/>
				 		:
				 		null
				 	}

				 	{
	      				(rowData.orderStatus==2 && rowData.isAppraise==0)?
				 		<Button 
				 		onPress={()=>this.props.navigator.push({component:OrderAppraises,passProps:{orderId:rowData.orderId, refresh:this._onRefresh}})} 
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'评价'}/>
				 		:
				 		null
	      			}

	      			{
	      				(rowData.isAppraise==1)?
				 		<Button 
				 		onPress={()=>this.props.navigator.push({component:OrderAppraises,passProps:{orderId:rowData.orderId, refresh:this._onRefresh}})}
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'查看评价'}/>
				 		:
				 		null
	      			}

	      			{	
	      				(rowData.allowRefund==1 && (rowData.orderStatus==-1 || rowData.orderStatus==-3) )?
				 		<Button 
				 		onPress={()=>this.showRefundDialog(rowData.orderId)} 
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'申请退款'}/>
				 		:
				 		null
	      			}

				 	{
	      				(rowData.orderStatus==1)?
	      				<Button 
				 		onPress={()=>this.showDialog('receive', rowData.orderId)} 
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'确认收货'}/>
	      				:
	      				null
	      			}

	      			{
	      				(rowData.orderStatus==1)?
	      				<Button 
				 		onPress={()=>this.showDialog('reject', rowData.orderId)} 
				 		style={[styles.order_btn,styles.bad_btn,styles.center]} 
				 		textStyle={[styles.btn_text]} text={'拒收'}/>
	      				:
	      				null
	      			}

	      			{	
				 		((rowData.orderStatus==1 || rowData.orderStatus!=-1) && rowData.orderStatus!=-2 && rowData.isComplain==0)?
				 		<Button 
				 		onPress={()=>this.props.navigator.push({component:OrderComplain,passProps:{orderId:rowData.orderId,_onRefresh:this._onRefresh}})}
				 		style={[styles.order_btn,styles.bad_btn,styles.center]} 
				 		textStyle={[styles.btn_text]} text={'投诉'}/>
				 		:
				 		null
				 	}
				 	{/*# 物流插件 #*/}
				 	{	
				 		(rowData.deliverType=='送货上门' && rowData.orderStatus==1 && Logistics!=undefined && Logistics.enable && Logistics.enable==1)?
				 		<Button 
				 		onPress={()=>this.props.navigator.push({component:Logistics,passProps:{orderId:rowData.orderId,_onRefresh:this._onRefresh}})}
				 		style={[styles.order_btn,styles.good_btn,styles.center]} 
				 		textStyle={[styles.red]} text={'查看物流'}/>
				 		:
				 		null
				 	}
	      			

				 	
	      		</View>
	      	</TouchableOpacity>
		);
	}
	// 跳转支付页面
	toPay(orderNo){
		let that = this;
		this.props.navigator.push({
			component:PayType,
			passProps:{
				refresh:that._onRefresh,
				orderNo:orderNo
			}
		});
	}
	renderOrderGoods(goodsData){
		let code = [];
		for(let i in goodsData){
			let goods = goodsData[i];
			code.push(
				<View key={goods.id} style={[styles.goods_item,styles.row]}>
      				<Image source={{uri:domain+goods.goodsImg}} style={styles.goods_img} />
      				<Text style={[styles.goods_name,styles.c13_333]}>{goods.goodsName}</Text>
      				<Text style={[styles.goods_price_num,styles.c13_333]}>￥{goods.goodsPrice} x{goods.goodsNum}</Text>
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
				orderId:orderId
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
				<TouchableOpacity style={[styles.flex_1,styles.center]} onPress={this._onRefresh}>
					<Image source={require('./../../img/order_empty.png')} style={{width:width*0.251,height:width*0.251}} />
					<Text style={styles.text}>
						您暂时还没有相关订单
					</Text>
				</TouchableOpacity>
				);
		}
		return(
			  <View style={styles.flex_1}>
			      <ListView
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
			    	{/* 确认收货对话框 */}
					<Modal
					  style={styles.modal}
			          visible={this.state.receiveShow}>
						<View style={[styles.flex_1,styles.center]}>
							<View style={styles.dialog}>
								<View style={[styles.center]}>
								</View>
								{/* 内容 */}
								<View style={[styles.dialog_main,styles.center]}>
								    <View>
										<Text>你确定已收到货吗?</Text>
										<View style={{borderWidth:1,borderColor:'#dddddd',marginTop:10}}>
										</View>
									</View>

								</View>
								{/* 按钮 */}
								<View style={[styles.row,styles.center,styles.modal_btn_box]}>
									<Button 
							 		onPress={()=>this.setState({receiveShow:false})} 
							 		style={[styles.modal_btn,styles.modal_bad_btn,styles.center]} 
							 		textStyle={[styles.bad_btn_text]} text={'取消'}/>

							 		<Button 
							 		onPress={()=>this.receive()} 
							 		style={[styles.modal_btn,styles.modal_good_btn,styles.center]} 
							 		textStyle={[styles.good_btn_text]} text={'确定'}/>
								</View>
							</View>
						</View>
					</Modal>
					{/* 取消订单对话框 */}
					<Modal
					  style={styles.modal}
			          visible={this.state.cancelShow}>
						<View style={[styles.flex_1,styles.center]}>
							<View style={styles.dialog}>
								<View style={[styles.center]}>
								</View>
								{/* 内容 */}
								<View style={[styles.dialog_main,styles.center]}>
								    <View>
										<Text>请选择你取消订单的原因：</Text>
										<View style={styles.selecte}>
										{
											global._platfrom=='ios'
											?
											<ModalDropdown 
												textStyle={styles.ios_select_text}
												defaultValue={'请选择'}
												style={styles.ios_select}
				                                onSelect={(rowId,rowData)=>this.iosSelected(rowData)}
				                                options={this.renderIosReasonData('cancel')}/>
											:
											<Picker
											  style={{height:30,}}
											  mode={'dropdown'}
											  selectedValue={this.state.cancelReason}
											  onValueChange={(val) => this.setState({cancelReason: val})}>
											  {this.renderReasonData('cancel')}
											</Picker>
										}
										</View>
									</View>

								</View>
								{/* 按钮 */}
								<View style={[styles.row,styles.center,styles.modal_btn_box]}>
									<Button 
							 		onPress={()=>this.setState({cancelShow:false})} 
							 		style={[styles.modal_btn,styles.modal_bad_btn,styles.center]} 
							 		textStyle={[styles.bad_btn_text]} text={'取消'}/>

							 		<Button 
							 		onPress={()=>this.cancelOrder()} 
							 		style={[styles.modal_btn,styles.modal_good_btn,styles.center]} 
							 		textStyle={[styles.good_btn_text]} text={'确定'}/>
								</View>
							</View>
						</View>
					</Modal>
					{/* 拒收订单对话框 */}
					<Modal
					  style={styles.modal}
			          visible={this.state.rejectShow}>
						<View style={[styles.flex_1,styles.center]}>
							<View style={styles.dialog}>
								<View style={[styles.center]}>
								</View>
								{/* 内容 */}
								<View style={[styles.dialog_main,styles.center]}>
								    <View>
										<Text>请选择你拒收订单的原因：</Text>
										<View style={styles.selecte}>
											{
											global._platfrom=='ios'
											?
											<ModalDropdown 
												textStyle={styles.ios_select_text}
												defaultValue={'请选择'}
												style={styles.ios_select}
				                                onSelect={(rowId,rowData)=>this.iosSelected(rowData)}
				                                options={this.renderIosReasonData('reject')}/>
											:
											<Picker
											  style={{height:30,}}
											  mode={'dropdown'}
											  selectedValue={this.state.rejectReason}
											  onValueChange={(val) => this.setState({rejectReason: val})}>
											  {this.renderReasonData('reject')}
											</Picker>
											}

										</View>
										{
											(this.state.rejectReason==10000)
											?
											<View style={styles.reject_box}>
												<Text>原因：</Text>
												<View style={styles.dialog_add}>
												<TextInput 
													height={40}
													underlineColorAndroid="transparent"
													onChangeText={(val)=>this.setState({rejectRemark:val})}
													placeholder={'请输入拒收原因'} />
												</View>
											</View>
											:
											null
										}
										
									</View>

								</View>
								{/* 按钮 */}
								<View style={[styles.row,styles.center,styles.modal_btn_box]}>
									<Button 
							 		onPress={()=>this.setState({rejectShow:false})} 
							 		style={[styles.modal_btn,styles.modal_bad_btn,styles.center]} 
							 		textStyle={[styles.bad_btn_text]} text={'取消'}/>

							 		<Button 
							 		onPress={()=>this.rejectOrder()} 
							 		style={[styles.modal_btn,styles.modal_good_btn,styles.center]} 
							 		textStyle={[styles.good_btn_text]} text={'确定'}/>
								</View>
							</View>
						</View>
					</Modal>
					{/* 退款操作对话框 */}
					<Modal
					  style={styles.modal}
			          visible={this.state.refundShow}>
						<View style={[styles.flex_1,styles.center]}>
							<View style={styles.dialog}>
								<View style={[styles.center]}>
								</View>
								{/* 内容 */}
								<View style={[styles.dialog_main,styles.center]}>
								    <View>
										<Text style={{maxWidth:width*0.6}}>请选择取消订单申请退款的原因,以便我们能更好的服务。</Text>
										<Text>原因：</Text>
										<View style={styles.selecte}>
											{
											global._platfrom=='ios'
											?
											<ModalDropdown 
												textStyle={styles.ios_select_text}
												defaultValue={'请选择'}
												style={styles.ios_select}
				                                onSelect={(rowId,rowData)=>this.iosSelected(rowData)}
				                                options={this.renderIosReasonData('refund')}/>
											:
											<Picker
											  style={{height:30,}}
											  mode={'dropdown'}
											  selectedValue={this.state.refundReason}
											  onValueChange={(val) => this.setState({refundReason: val})}>
											  {this.renderReasonData('refund')}
											</Picker>
											}
										</View>
										{
											(this.state.refundReason==10000)
											?
											<View>
												<Text>原因：</Text>
												<View style={styles.dialog_add}>
												<TextInput 
													height={40}
													underlineColorAndroid="transparent"
													onChangeText={(val)=>this.setState({refundRemark:val})}
													placeholder={'请输入退款原因'} />
												</View>
											</View>
											:
											null
										}
										<View>
											<Text>退款金额：</Text>
											<View style={[styles.dialog_add,styles.selecte]}>
											<TextInput 
												height={40}
												keyboardType={'numeric'}
												underlineColorAndroid="transparent"
												onChangeText={(val)=>this.setState({refundMoney:val})}
												placeholder={'请输入退款金额'} />
											</View>
											<Text>
											金额不能超过
												<Text style={styles.red}>￥{this.state.canRefundMoney}</Text>
											</Text>
											<Text>
												{this.state.useScore}积分抵扣
												<Text style={styles.red}>￥{this.state.scoreMoney}</Text>
											</Text>
										</View>
										
									</View>

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
		backgroundColor:'#eee',
	},
	flex_1:{flex:1},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	red:{
		fontSize:11,
		color:'#d82a2e'
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
		padding:15,
		paddingTop:10,
		paddingBottom:10,
		borderBottomWidth:1,
		borderBottomColor:'#eee'
	},
	order_status:{
		fontSize:15,
	},
	// 订单下的商品列表
	order_goods_list:{
	},
	goods_item:{
		padding:15,
		paddingBottom:5,
		paddingTop:5,
		borderBottomWidth:1,
		borderBottomColor:'#eee',
	},
	goods_name:{
		flex:3,
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
		paddingRight:15,
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
	refresh_btn:{
		marginTop:10,
		borderColor:'#f1f1f2'
	},
	// dialog
	modal:{
		top: 0,
	    right: 0,
	    bottom: 0,
	    left: 0,
	    justifyContent: 'center',
	    alignItems: 'center',
	    backgroundColor: 'rgba(0, 0, 0, 0.5)'
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
		width:width*0.6
	},
	// 补充内容
	dialog_add:{
		height:40,
		borderWidth:1,
		borderColor:'#ccc'
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