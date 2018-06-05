import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ListView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  NetInfo,
  InteractionManager,
  StatusBar
} from 'react-native';
// 显示刷新页面
import Refresh from './../common/refresh';
// 工具
import Utils from './../common/utils';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
// 搜索框
import Search from './goods_search';
// 商品详情
import Detail from './goods_detail';
export default class SelfShop extends Component{
	constructor(props){
		super(props);

		var status = true;
		// 筛选条件数组
		this.filterArr = ['sale','price','hot','time'];
		// 选中时的样式
		this._style = {borderBottomWidth:0,borderColor:'#d82a2e'};
		this._style_text = {color:'#d82a2e'};
		/*['saleNum','shopPrice','visitNum','saleTime']
			0           1          2           3*/
		this.msort = {'hot':2,'sale':0,'price':1,'time':3};
		// 推荐数据
		var recData,domain;

		this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 评论数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
		this.state={
			ds:ds,
			_listViewHeadHeight:Utils.height*0.1,// 没有商品推荐时,头部的高度
		};

		// 是否有网络
		this.state.isConnected = true;

		for(let i in this.filterArr){
			let index = 'curr_'+this.filterArr[i];
			let index1 = 'curr_'+this.filterArr[i]+'_text';
			this.state[index] = {};
			this.state[index1] = {};
		}
		// 是否有商品数据
		this.state.hasGoods = false;
		// 用户搜索关键字记录
		this.state.goodsName = '';

		// 默认的过滤选中
		this.state.curr_sale = this._style;
		this.state.curr_sale_text = this._style_text;

		// 箭头方向
		this.state.arrow_up = false;

		// 请求数据中
		this.state.loading = true;

		// 是否关注
		this.state.fId = 0;

		// 绑定this
		this.getData = this.getData.bind(this);
		this.changeFilter = this.changeFilter.bind(this);
		this.getGoods = this.getGoods.bind(this);
		this.goodsSearch = this.goodsSearch.bind(this);
		this.viewGoods = this.viewGoods.bind(this);
		this._onRefresh = this._onRefresh.bind(this);

		this._onDataArrived = this._onDataArrived.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.renderListViewHead = this.renderListViewHead.bind(this);

	}
	// 渲染商品名称
	renderGoodsName(goods){
		return(
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
		);
	}
	/************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(goods, sectionID, rowId){
		return(
			<TouchableOpacity key={rowId} style={styles.goodsItem} onPress={()=>this.viewGoods(goods.goodsId)}>
				<Image resizeMode={'contain'} source={{uri:domain+goods.goodsImg}} style={styles.goodsImg} />
				{
					goods.shopId==1
					?
					<View>
						{this.renderGoodsName(goods)}
						<View style={[styles.row,styles.center]}>
							<Text style={{borderWidth:1,borderColor:'#d82a2e',marginLeft:5,}}>
								<Text style={{fontSize: 10,color:'#d82a2e'}}> 自营 </Text>
							</Text>
							<Text style={[styles.flex_1,{color:'rgba(0,0,0,0)'}]}>占位</Text>
						</View> 
					</View>
					:
					<View>
						{this.renderGoodsName(goods)}
						<View style={[styles.row,styles.center]}>
							<Text style={[styles.flex_1,{color:'rgba(0,0,0,0)'}]}>占位</Text>
						</View> 
					</View>
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
	  	this.setState({loading:false,isRefreshing:false,hasGoods:false,});
	  	return;
	  }
	  this.setState({
	    ds: this.state.ds.cloneWithRows(newData),
	    loading:false,
		hasGoods:true,
		isRefreshing:false,
	  });
	};
	// 获取商品数据
	getGoods(catId,msort,mdesc,goodsName){
		let that = this;

		// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;


		let gName = goodsName || '';
		/* 
		参数：
			{
				catId:61
				brandId:
				condition:0
				desc:1
				keyword:
			}
		*/
		let currSort = msort || this._currSort;
		let currDesc = mdesc || this._currDesc;
		let postData = {
			catId:that.props.catId,// this.props.catId 店铺id由外部传递
			condition:currSort,
			desc:currDesc,
			keyword:gName,
			page:that.currPage+1, // 当前请求的页数
			areaId:global.areaId,
		}
		if(this.props.brandId)postData.brandId = this.props.brandId;
		if(this.props.isHot)postData.isHot = this.props.isHot;
		if(this.props.isBest)postData.isBest = this.props.isBest;
		Utils.post(Utils.domain+'app/goods/pageQuery',
					postData,
					(responData)=>{
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
						}
					},
					(err)=>{
						console.log('商品列表请求商品数据出错',err)
					});
	}


	
	//  请求数据【热卖推荐】
	getData(){
		let that = this;
		//不存在缓存
		let url = Utils.domain+'app/goods/getCatRecom?catId='+this.props.catId
		Utils.get(
				url,
				(responData)=>{
					if(responData.status==1){
						// 缓存一份
						global.storage.save({
							key:'recData',
							rawData:responData,
							expried:1000 * 3600 * 24 // 单位为毫秒
						})
						recData = responData.data;
						that.setState({_listViewHeadHeight:Utils.height*0.44});
					}
					// 请求商品数据
					that.getGoods(that.props.catId, 0, 0, that.props.goodsName);
				},
				(err)=>{
					that.requestFail(err);
				});




	}
	requestFail(err){
		console.log('商品列表出错',err);
		let that = this;
		// 网络请求超时或断网时 [TypeError: Network request failed]
		if(err.toString().indexOf('Network request failed')!=-1){
			Utils.msg('网络连接超时...');
			that.setState({
				isConnected:false
			});
		}

	}
	// 组件挂载完毕
	componentDidMount(){
		InteractionManager.runAfterInteractions(() => {
			// 检测网络状态
			NetInfo.isConnected.fetch().done((isConnected) => {
			  if(isConnected || global._platfrom=='ios'){
				// 请求推荐商品
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
			  this.getData();
			}else{
			  // 当前无网络连接
			  this.setState({
				isConnected:false,
			  });
			}
		});
	  }
	// 组件卸载
	componentWillUnmount(){
		// 清空变量
		recData = null;
	}
	// 进入商品详情页
	viewGoods(goodsId){
		this.props.navigator.push({
			component:Detail,
			passProps:{
				goodsId:goodsId
			}
		});
	}


	// 渲染热卖推荐下的商品
	renderRecommendGoods(){
		let code = [];
		for(let i in recData){
			let goods = recData[i];
			code.push(
				<View key={goods.goodsId} style={[styles.rec_item]}>
						<TouchableOpacity onPress={()=>this.viewGoods(goods.goodsId)}>
							<Image resizeMode={'contain'} source={{uri:domain+goods.goodsImg}} style={styles.rec_img} />
						</TouchableOpacity>
						<Text style={styles.c12_333} numberOfLines={2}>{goods.goodsName}</Text>
						<View style={styles.rec_price}>
							<Text onPress={()=>this.viewGoods(goods.goodsId)} style={styles.rec_text}>￥{goods.shopPrice}</Text>
						</View>
				</View>
			);
		}
		return code;
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
		for(let i in this.filterArr){
			let index = 'curr_'+this.filterArr[i];
			let index1 = 'curr_'+this.filterArr[i]+'_text';
			if(val==this.filterArr[i]){
				obj[index] = this._style;
				obj[index1] = this._style_text;
			}else{
				obj[index] = {};
				obj[index1] = {};
			}
		}


		/*
		
		$orderFile = array('1'=>'g.isHot','2'=>'g.saleNum','3'=>'g.shopPrice','4'=>'g.shopPrice','5'=>'(gs.totalScore/gs.totalUsers)','6'=>'g.saleTime');
		$orderSort = array('0'=>'asc','1'=>'desc');

		*/
		let sort = this.msort[val];
		let desc = !obj.arrow_up?0:1;


		// 记录当前排序方式
		this._currSort = sort;
		this._currDesc = desc;

		this.getGoods(this.props.catId, sort, desc, this.state.goodsName);
		this.setState(obj);
	}
	// 商品搜索
	goodsSearch(goodsName){
		// 重置rowData
		this._data = [];
		// 将当前页置为1
		this.currPage = 0;
		this.totalPage = 100;

		// 记录搜索的商品名称
		this.setState({
			goodsName:goodsName
		});
		let sort = 2;// 搜索时,默认是选中销量
		let desc = 0; // 默认是倒序排序

		// 记录当前排序方式
		this._currSort = sort;
		this._currDesc = desc;
		this.getGoods(this.props.catId, sort, desc, goodsName);
	}
	renderHeader(){
		return(
			<Search 
				placeholder={'请输入商品名称'}
				commit={this.goodsSearch}
				shopId={this.props.catId}
				value={this.props.goodsName}
				navigator={this.props.navigator} />
		);
	}
	renderListViewHead(){
		return(
			<View style={{height:this.state._listViewHeadHeight}}>
				{/* 热卖推荐 */}
					{
						(recData!=undefined)
						?
						<View style={[styles.recommend]}>
								<View style={[styles.rec_title_box,styles.center,styles.row]}>
									<View style={styles.rec_title_line}></View>
									<Text style={styles.rec_title}>热卖
										<Text style={styles.bold}>推荐</Text>
									</Text>
									<View style={styles.rec_title_line}></View>
								</View>
								<ScrollView 
									horizontal={true} 
									showsHorizontalScrollIndicator={false} 
									style={[styles.rec_box]}>
									{this.renderRecommendGoods()}
								</ScrollView>
						</View>
						:
						null
					}

						<View style={[styles.row,styles.filter_box]}>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_sale]}
								onPress={()=>this.changeFilter('sale')}>
								<Text style={[styles.filter_item_text,this.state.curr_sale_text]}>销量</Text>
								{
									(Object.keys(this.state.curr_sale)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={18} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={18} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={18} />
								}
								
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_price]}
								onPress={()=>this.changeFilter('price')}>
								<Text style={[styles.filter_item_text,this.state.curr_price_text]}>价格</Text>
								{
									(Object.keys(this.state.curr_price)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={18} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={18} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={18} />
								}
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_hot]}
								onPress={()=>this.changeFilter('hot')}>
								<Text style={[styles.filter_item_text,this.state.curr_hot_text]}>人气</Text>
								{
									(Object.keys(this.state.curr_hot)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={18} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={18} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={18} />
								}
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.flex_1,styles.row,styles.center,styles.filter_item,this.state.curr_time]}
								onPress={()=>this.changeFilter('time')}>
								<Text style={[styles.filter_item_text,this.state.curr_time_text]}>上架时间</Text>
								{
									(Object.keys(this.state.curr_time)!='')?(
									(this.state.arrow_up)?
									<Icon name={'arrow-drop-up'} size={18} color={'red'} />
									:
									<Icon name={'arrow-drop-down'} size={18} color={'red'} />
									)
									:
									<Icon name={'arrow-drop-down'} size={18} />
								}
							</TouchableOpacity>

						</View>
			</View>
		);
	}

	// 渲染
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return (
					<View style={styles.flex_1}>
					<StatusBar backgroundColor='black' animated={true} Style="light-content" />
					{/* 搜索框 */}
					{this.renderHeader()}
					{Utils.loading()}
					</View>
				);
		}

		return(
			<View style={styles.flex_1}>
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
						onEndReached ={this.getGoods}
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
						<View style={[styles.flex_1,styles.center,styles.row,{height:Utils.height*0.3}]}>
							<Image source={require('./../img/no_goods.png')} resizeModal={'cover'} style={{width:25,height:25}} />
							<Text style={{fontSize:13,fontWeight:'bold',color:'#999',marginLeft:10,}}>没找到相关宝贝,试试另一个关键词搜索哦</Text>
						</View>
					}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#f6f6f8',
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
	// 推荐商品
	recommend:{
		width:Utils.width,
		height:Utils.height*0.35,
		marginBottom:10
	},
	rec_title_box:{
		backgroundColor:'#eee',
		height:30,
	},
	rec_title_line:{
		width:80,
		height:1,
		backgroundColor:'#dadada'
	},
	rec_title:{
		paddingLeft:10,
		paddingRight:10,
		textAlign:'center',
		fontSize:13,
		color:'#333'
	},
	bold:{
		fontWeight:'bold',
	},
	rec_box:{
		flex:1,
		backgroundColor:'#fff',
		paddingLeft:7,
	},
	rec_item:{
		marginRight:8,
		width:Utils.width*0.334-10,
		height:Utils.width*0.5-5,
	},
	rec_img:{
		position:'relative',
		width:Utils.width*0.334,
		height:Utils.width*0.334,
	},
	c12_333:{
		fontSize:12,
		color:'#333',
		paddingTop:5,
		paddingHorizontal:5,
	},
	rec_price:{
		position:'absolute',
		bottom:0,
		backgroundColor:'rgba(255,255,255,0.6)',
		width:Utils.width*0.3,
	},
	rec_text:{
		width:Utils.width*0.3,
		textAlign:'center',
		color:'#d82a2e',
		fontSize:12,
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
		maxHeight:Utils.width*0.5+90,
		backgroundColor:'#fff',
		borderWidth:1,
		borderColor:'rgba(0,0,0,0)'
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
		overflow:'hidden',
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
		marginLeft:5,
		color:'#999',
		fontSize:10,
	},
	// 筛选条件
	filter_box:{
		paddingHorizontal:10,
		width:Utils.width,
		backgroundColor:'#fff',
		maxHeight:45,
	},
	filter_item:{
		padding:5,
	},
	filter_item_text:{
		paddingVertical:5,
		textAlign:'center',
		color:'#333',
		fontSize:13
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
