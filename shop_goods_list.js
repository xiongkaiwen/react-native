import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ListView,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  NetInfo,
  InteractionManager,
  StatusBar
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
// 工具
import Utils from './common/utils';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons'
// 搜索框
import Search from './shop_search';
// 商品详情
import GoodsDetail from './goods/goods_detail';
//店铺首页
import ShopIndex from './shop_index';
//购物车
import Cart from './Cart';
//登录页面
import Login from './login';
var status = true;
// 筛选条件数组
var filterArr = ['sale','price','hot','time'];

var msort = {'hot':1,'sale':2,'price':3,'time':6};

	// 选中时的样式
var _style = {borderBottomWidth:0,borderColor:'red'};
var _style_text = {color:'red'};

// 店铺数据
var data;

// 商品数据
var shopGoods,
	domain;
export default class SelfShop extends Component{
	constructor(props){
		super(props);
		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 评论数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
		this.state={
			ds:ds,
			_listViewHeadHeight:Utils.height*0.1
		};
		// 是否有网络
		this.state.isConnected = true;
		for(let i in filterArr){
			let index = 'curr_'+filterArr[i];
			let index1 = 'curr_'+filterArr[i]+'_text';
			this.state[index] = {};
			this.state[index1] = {};
		}
		// 是否有商品数据
		this.state.hasGoods = false;
		// 用户搜索关键字记录
		this.state.goodsName = '';

		// 默认的过滤选中
		this.state.curr_sale = _style;
		this.state.curr_sale_text = _style_text;

		// 箭头方向
		this.state.arrow_up = false;

		// 请求数据中
		this.state.loading = true;

		// 是否关注
		this.state.favorite = false;
		this.state.fId = 0;

		// 默认排序及条件
		this.sort = 2;
		this.desc = 0;

		// 绑定this
		this.changeFilter = this.changeFilter.bind(this);
		this.getShopGoods = this.getShopGoods.bind(this);
		this.goodsSearch = this.goodsSearch.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
		this.toCart = this.toCart.bind(this);

		this._onDataArrived = this._onDataArrived.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.renderListViewHead = this.renderListViewHead.bind(this);
	}
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(goods, sectionID, rowId){
		return(
			<TouchableOpacity key={rowId} style={styles.goodsItem} onPress={()=>this.viewGoodsDetail(goods.goodsId)}>
					<Image resizeMode={'contain'} source={{uri:domain+goods.goodsImg}} style={styles.goodsImg} />
					{
						goods.isFreeShipping==1
						?
						<Text style={[styles.goodsName]} numberOfLines={2}>
							<Text style={[styles.label,styles.center]}>
								<Text style={styles.label_text}> 包邮 </Text>
							</Text> {goods.goodsName}
						</Text>
						:
						<Text style={[styles.goodsName]} numberOfLines={2}>
							{goods.goodsName}
						</Text>
					}
					<View style={styles.goodsInfo}>
						<View style={[styles.row,{alignItems:'center'}]}>
							<Text style={styles.goodsPrice}>
								<Text style={styles.f11}>￥</Text>{goods.shopPrice.split('.')[0]}.<Text style={styles.f11}>{goods.shopPrice.split('.')[1]}</Text>
							</Text>
						</View>
						<Text numberOfLines={1} style={styles.goodsSale}>成交数:{goods.saleNum}</Text>
					</View>
				</TouchableOpacity>
		);
	}
	// 设置dataSource
	_onDataArrived(newData){
	  if(newData.length==0){
	  	// 没有数据
	  	this.setState({isRefreshing:false,hasGoods:false,});
	  	return;
	  }
	  this.setState({
	    ds: this.state.ds.cloneWithRows(newData),
		hasGoods:true,
		isRefreshing:false,
	  });
	};




	// 进入商品详情
	viewGoodsDetail(goodsId){
		let that = this;
		that.props.navigator.push({
			component:GoodsDetail,
			passProps:{
				goodsId:goodsId
			}
		});
	}

	
	//  请求数据
	// 组件挂载完毕
	componentDidMount(){
		// 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
		  if(isConnected || global._platfrom=='ios'){
			// 请求店铺数据
			this.getShopGoods(this.props.shopId, this.sort, this.desc, this.props.goodsName);
		  }else{
			// 当前无网络连接
			this.setState({
			  isConnected:false,
			});
		  }
		});
		
	}
	_onRefresh(){
		InteractionManager.runAfterInteractions(() => {
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
					loading:false,
					isRefreshing:true,
				  });
				  // 请求店铺数据
				  this.getShopGoods(this.props.shopId,2,0,'');
				}else{
				  // 当前无网络连接
				  this.setState({
					isConnected:false,
				  });
				}
			});
	    });
	  }
	// 点击筛选条件
	changeFilter(val){
		// 重置rowData
		this._data = [];
		// 将当前页置为1
		this.currPage = 0;

		let obj = {};
		let curr = 'curr_'+val;
		// 在已选中的情况下点击,则更换箭头方向
		if(Object.keys(this.state[curr]).length>0 && this.state.arrow_up){
			obj.arrow_up = false;
		}else if(Object.keys(this.state[curr]).length>0){
			obj.arrow_up = true;
		}else{
			obj.arrow_up = false;
		}


		// 先把所有选中样式清空
		for(let i in filterArr){
			let index = 'curr_'+filterArr[i];
			let index1 = 'curr_'+filterArr[i]+'_text';
			if(val==filterArr[i]){
				obj[index] = _style;
				obj[index1] = _style_text;
			}else{
				obj[index] = {};
				obj[index1] = {};
			}
		}


		/*
		
		$orderFile = array('1'=>'g.isHot','2'=>'g.saleNum','3'=>'g.shopPrice','4'=>'g.shopPrice','5'=>'(gs.totalScore/gs.totalUsers)','6'=>'g.saleTime');
		$orderSort = array('0'=>'asc','1'=>'desc');

		*/
		// 当前条件与排序
		this.sort = msort[val];
		this.desc = !obj.arrow_up?1:0;

		let sort = msort[val];
		let desc = !obj.arrow_up?1:0;

		this.getShopGoods(this.props.shopId, sort, desc, this.state.goodsName);
		this.setState(obj);
	}
	// 商品搜索
	goodsSearch(goodsName){
		// 重置rowData
		this._data = [];
		// 将当前页置为1
		this.currPage = 0;

		// 记录搜索的商品名称
		this.setState({
			goodsName:goodsName
		});
		let sort = 2;// 搜索时,默认是选中销量
		let desc = 0; // 默认是倒序排序
		this.getShopGoods(this.props.shopId, sort, desc, goodsName);
	}

	// 获取商品数据
	getShopGoods(shopId,msort,mdesc,goodsName){
		let that = this;

		// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;

		/* 
		参数：
			{
				shopId:1
				msort:2
				mdesc:0
				goodsName:
				ct1:3
				ct2:0
			}
		*/
		let ct1 = this.props.ct1 || 0;
		let ct2 = this.props.ct2 || 0;
		let postData = {
			shopId:shopId!=undefined?shopId:that.props.shopId,// this.props.shopId 店铺id由外部传递
			msort:msort!=undefined?msort:that.sort,
			mdesc:mdesc!=undefined?mdesc:that.desc,
			goodsName:goodsName!=undefined?goodsName:that.state.goodsName,
			ct1:ct1,// 0
			ct2:ct2,// 0
			page:that.currPage+1, // 当前请求的页数
		};
		Utils.post(Utils.domain+'app/shops/getShopGoods',
					postData,
					function(responData){
						if(responData.status==1){
							let _shopData = responData.data;
							// 域名
							domain = responData.data.domain;
							// 总页数
							that.totalPage = parseInt(_shopData.TotalPage,10);
							// 当前页
							that.currPage = parseInt(_shopData.CurrentPage,10);
							// 评论数据
							let shopData = responData.data.Rows;
							that._data = that._data.concat(shopData);
							// 更新ds
							// 获取到的订单数据 传递给__renderRow
							that._onDataArrived(that._data);
							that.setState({loading:false});
						}else{
							that.setState({loading:false,hasGoods:false});
						}
					},
					function(err){
						console.log('店铺商品列表页出错',err);
						// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}
					});
	}

	//购物车
	toCart(){
		if(global.isLogin){
			this.props.navigator.push({component:Cart});
		}else{
			this.props.navigator.push({component:Login});
		}
	}
	renderListViewHead(){
		return(
			<View style={{height:this.state._listViewHeadHeight}}>

						<View style={[styles.row,styles.filter_box]}>
							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_sale]}
								onPress={()=>this.changeFilter('sale')}>
								<Text style={[styles.filter_item_text,this.state.curr_sale_text]}>销量</Text>
								{
									(Object.keys(this.state.curr_sale)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={20} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={20} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={20} />
								}
								
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_price]}
								onPress={()=>this.changeFilter('price')}>
								<Text style={[styles.filter_item_text,this.state.curr_price_text]}>价格</Text>
								{
									(Object.keys(this.state.curr_price)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={20} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={20} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={20} />
								}
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_hot]}
								onPress={()=>this.changeFilter('hot')}>
								<Text style={[styles.filter_item_text,this.state.curr_hot_text]}>人气</Text>
								{
									(Object.keys(this.state.curr_hot)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={20} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={20} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={20} />
								}
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_time]}
								onPress={()=>this.changeFilter('time')}>
								<Text style={[styles.filter_item_text,this.state.curr_time_text]}>上架时间</Text>
								{
									(Object.keys(this.state.curr_time)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={20} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={20} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={20} />
								}
							</TouchableOpacity>

						</View>
				</View>
		);
	}
	renderHeader(){
		return(
			<Search 
				placeholder={'搜索本店商品'}
				goodsName={this.props.goodsName}
				commit={this.goodsSearch}
				shopId={this.props.shopId}
				navigator={this.props.navigator} />
		);
	}
	// 渲染
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return (
				<View style={styles.contrainer}>
					<StatusBar backgroundColor='black' animated={true} Style="light-content" />
					{/* 搜索框 */}
					{this.renderHeader()}
					{Utils.loading()}
				</View>
			);
		}
		return(
			<View style={styles.contrainer}>
				<StatusBar backgroundColor='black' animated={true} Style="light-content" />
				{/* 搜索框 */}
				{this.renderHeader()}

					{/* 商品列表 */}
					{
						this.state.hasGoods
						?
						<ListView
						renderHeader={this.renderListViewHead}
						contentContainerStyle={styles.listview_content}
						onEndReachedThreshold={300} 
						onEndReached ={()=>this.getShopGoods()}
						style={styles.floorGoodsContrainer}
						dataSource={this.state.ds}
						renderRow={this._renderRow}
						refreshControl={ 
				          <RefreshControl
				            refreshing={this.state.isRefreshing}
				            onRefresh={this._onRefresh}
				            colors={['#00ff00', '#ff0000', '#0000ff']}/> 
				        }/>
						:
						<View style={[styles.flex_1]}>
							{this.renderListViewHead()}
							<View style={[styles.flex_1,styles.center,{height:Utils.height*0.3}]}><Text style={{fontSize:20,fontWeight:'bold'}}>没有相关商品</Text></View>
						</View>
					}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#f6f6f8',
		height:'100%',
	},
	flex_1:{
		flex:1,
	},
	row:{
		flexDirection:'row'
	},
	center:{
		justifyContent:'center',
		alignItems:'center'
	},
	listview_content:{
		justifyContent:'space-between',
		flexDirection:'row',
		width:Utils.width,
		flexWrap:'wrap',
		paddingBottom:20,
	},
	// 商品列表
	floorGoodsContrainer:{
		backgroundColor:'#eee',
	},
	goodsItem:{
		marginTop:5,
		// 整个商品item的宽度
		width:Utils.width*0.5-5,
		// 整个商品item的高度
		maxHeight:Utils.width*0.5+60,
		backgroundColor:'#fff'
	},
	goodsImg:{
		width:Utils.width*0.5-5,
		height:Utils.width*0.5-5,
	},
	goodsName:{
		color:'#333',
		fontSize:12,
		paddingHorizontal:5,
		marginTop:5,
		minHeight:30,
		overflow:'hidden'
	},
	goodsInfo:{
		flexDirection:'row',
		justifyContent:'space-between',
		padding:5,
		alignItems:'flex-end',
	},
	f11:{
		fontSize:11
	},
	goodsPrice:{
		fontSize:13,
		textAlign:'left',
		color:'#d82a2e'
	},
	goodsSale:{
		fontSize:12,
		textAlign:'right',
	},
	// 按钮样式
	btn:{
		width:Utils.width*0.25-30,
		padding:3,
		borderRadius:5,
		backgroundColor:'#fff',
		borderWidth:1,
		borderColor:'red',
	},
	btnText:{
		textAlign:'center',
		color:'red',
		fontSize:12,
	},
	// 筛选条件
	filter_box:{
		marginTop:10,
		width:Utils.width,
		backgroundColor:'#fff'
	},
	filter_item:{
		padding:5,
	},
	filter_item_text:{
		paddingTop:5,
		paddingBottom:5,
		textAlign:'center',
	},
  	// 包邮标签
	label:{
		backgroundColor:'#d82a2e',
	},
	_label:{
		backgroundColor:'transparent',
		borderWidth:0,
	},
	label_text:{
		fontSize:10,
		color:'#fff',
	}
});
