/**
* 订单列表
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
// 订单详情页
import OrderDetail from './orders_detail';
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
	}
	// 获取订单数据
	// 请求数据
	getData(){
		let that = this;
		// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;
		// 请求接口
		let url = Utils.domain+'app/sharerorders/pagequery';
		let postData = {
			tokenId:global.tokenId,
			page:that.currPage+1, // 当前请求的页数
			state:that.props.orderState
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
		if(newData.length==0){
			// 没有数据
			this.setState({loading:false,isRefreshing:false,hasData:false});
			return;
		}
		this.setState({
			ds: this.state.ds.cloneWithRows(newData),
			loading:false,
			hasData:true,
			isRefreshing:false,
		});
	};
	// 执行顶部下拉刷新
	_onRefresh(){
		// 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
			if(isConnected || global._platfrom=='ios'){
			    // 重置rowData
				this._data = [];
				// 将当前页置为0
				this.currPage = 0;
				this.totalPage = 100;
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
	      	<TouchableOpacity activeOpacity={0.8} style={styles.order_item} onPress={()=>this.viewOrderDetail(rowData.id)}>
		      	<View style={[styles.row,styles.order_head]}>
		      		<View style={styles.row}>
			      		<Image source={require('./../../img/order_shop.png')} resizeMode={'cover'} style={{width:18,height:18*0.9,marginRight:5,}} />
			      		<Text style={styles.c13_333}>
			      			{rowData.shopName} | {rowData.orderNo}
			      		</Text>
		      		</View>
		      		<Text style={[styles.red,styles.order_status]}>{rowData.status}</Text>
		      	</View>
	      		<View style={styles.order_goods_list}>
	      			{this.renderOrderGoods(rowData.list)}
	      		</View>
				<View style={[styles.row,{justifyContent:'space-between',alignItems:'center'}]}>
					<Text style={styles.pdl15}>{rowData.loginName}</Text>
					<View style={[styles.row,styles.order_price]}>
						<Text style={[styles.c11_999,{marginRight:5}]}>共{rowData.list.length}件商品</Text>
						<Text style={styles.c13_333}>
							实付:￥{rowData.realTotalMoney}
						</Text>
					</View>
				</View>

	      	</TouchableOpacity>
		);
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
						暂时还没有相关订单
					</Text>
				</TouchableOpacity>
				);
		}
		return(
			  <View style={styles.flex_1}>
			      <ListView
				  	enableEmptySections = {true}
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
	pdl15:{paddingLeft:15,color:'#333'}

});