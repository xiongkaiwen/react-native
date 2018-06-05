/**
* 店铺街
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Picker,
  NetInfo,
  Platform,
  InteractionManager,
  StatusBar
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
//搜索框
import Search from './shop_street_search';
//工具类
import Utils from './common/utils';
//图标组件
import Icon from 'react-native-vector-icons/FontAwesome';
//图标组件
import Arrowicon from 'react-native-vector-icons/MaterialIcons';
// 店铺详情
import ShopHome from './shop_home';
// 商品详情
import GoodsDetail from './goods/goods_detail';


// 兼容ios
import ShopStreetIosSelect from './shop_street_ios_select';


// 数据
var shopDatas;

//筛选条件数组
var filterArr = ['sort','cats'];

var msort = {'cats':0,'sort':1};

// 选中时的样式
var _style = {borderBottomWidth:2,borderColor:'red'};
var _style_text = {color:'red'};

export default class ShopStreet extends Component {
    constructor(porp) {
        super(porp);
        this.currPage = 0; // 当前页码
		this.totalPage = 100; // 总页数
		this._data = []; // 评论数据
		// 创建dataSource对象
		var ds = new ListView.DataSource({
			rowHasChanged: (oldRow, newRow) => oldRow!==newRow
		});
        this.state= {
        	ds:ds,
            selectedValue: '',
            isRefreshing:true,
        }
        // 是否有网络
		this.state.isConnected = true;
		for(let i in filterArr){
			let index = 'curr_'+filterArr[i];
			let index1 = 'curr_'+filterArr[i]+'_text';
			this.state[index] = {};
			this.state[index1] = {};
		}
		// 默认的过滤选中
		this.state.curr_cats = _style;
		this.state.curr_cats_text = _style_text;
		// 请求数据中
		this.state.loading = true;
		// 是否有商品数据
		this.state.hasShops = true;

		// 绑定this
		this.changeFilter = this.changeFilter.bind(this);
		this.shopSearch = this.shopSearch.bind(this);
		this._onRefresh = this._onRefresh.bind(this);

		this._onDataArrived = this._onDataArrived.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.renderListViewHead = this.renderListViewHead.bind(this);
    }
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
    // 渲染商家推荐/热卖商品下的商品
	renderRecGoods(recData){
		let domain = shopDatas.data.domain;
		let code = [];
		for(let i in recData){
			let goods = recData[i];
			code.push(
				<View key={goods.goodsId} style={[styles.rec_item,styles.center]}>
					<TouchableOpacity onPress={()=>this.viewGoodsDetail(goods.goodsId)}>
						<Image source={{uri:domain+goods.goodsImg}} style={styles.rec_img} />
					</TouchableOpacity>
					<View style={styles.rec_price}>
						<Text onPress={()=>this.viewGoodsDetail(goods.goodsId)} style={styles.rec_text}>￥{goods.shopPrice}</Text>
					</View>
				</View>
			);
		}
		return code;
	}

    /************************** listView组件 *************************************/
	// 渲染row组件,参数是每行要显示的数据对象
	_renderRow(data, sectionID, rowId){
		return(
			<View key={data['shopId']} style={styles.shop}>
				 <View style={[styles.shop_head,styles.row]}>
				 	 <View style={styles.shopimg_box}>
		       	  	 	<Image source={{uri:shopDatas.data.domain+data['shopImg']}} style={styles.shopimg}/>
				 	 </View>
		      	  	 <View style={styles.shopr}>
		      	  	 	<Text style={styles.shopname}>{data['shopName']}</Text>
		      	  	 	<Text style={styles.shopinfo}>主营：{data['catshops']}</Text>
		      	  	 	<Text style={styles.shopinfo}>店铺评分：{this.score(data['totalScore'])}</Text>
		      	  	 </View>
		      	  	 <TouchableOpacity style={[styles.go_shop_box]} onPress={()=>this.props.navigator.push({component:ShopHome,passProps:{shopId:data['shopId']}})}>
		      	  	 	<Text style={[styles.go_shop]}>进店逛</Text>
		      	  	 </TouchableOpacity>
	      	  	 </View>
	      	  	 {/* 店铺推荐商品 */}
	      	  	 <View style={[styles.shop_goods]}>
	      	  	 	{this.renderRecGoods(data['rec'])}
	      	  	 </View>
	      	  </View>
		);
	}
	// 设置dataSource
	_onDataArrived(newData){
	  if(newData.length==0){
	  	// 没有数据
	  	this.setState({loading:false,isRefreshing:false,hasShops:false,});
	  	return;
	  }
	  this.setState({
	    ds: this.state.ds.cloneWithRows(newData),
		hasShops:true,
		isRefreshing:false,
	  });
	};
	// 获取店铺数据
	getShops(sort,desc,value,shopName){
		let that = this;
		// 请求页大于总数据页数,不做任何操作
		if((that.currPage+1) > that.totalPage)return;


		let sName = shopName || '';
		let catId = value || '';
		let postData = {
			condition:sort,
			desc:desc,
			keyword:sName,
			id:catId,
			page:that.currPage+1, // 当前请求的页数
		};
		Utils.post(Utils.domain+'app/shops/pageQuery',
					postData,
					function(responData){
						if(responData.status==1){
							let _shopData = responData.data;
							// 总页数
							that.totalPage = parseInt(_shopData.TotalPage,10);
							// 当前页
							that.currPage = parseInt(_shopData.CurrentPage,10);
							// 数据
							let shopData = responData.data.Rows;
							that._data = that._data.concat(shopData);
							// 更新ds
							// 获取到的数据 传递给__renderRow
							that._onDataArrived(that._data);
						}
					},
					function(err){
						console.log('店铺街出错',err);
					});
	}

    
	//  请求数据【获取分类筛选所需数据】
	getData(){
		let that = this;

		global.storage.load({
			key:'shopStreetFilter'
		}).then((filterData)=>{
			shopDatas = filterData;
			if(shopDatas.status==1){
				that.setState({
					loading:false
				  });
			}
		}).catch((err)=>{
		    Utils.get(Utils.domain+'app/shops/shopStreet',(filterData)=>{
		    	// 缓存一份
		    	global.storage.save({key:'shopStreetFilter',rawData:filterData,expried:86400*1000});
		    	shopDatas = filterData;
				if(shopDatas.status==1){
					that.setState({
						loading:false
					  });
					}
		    },function(err){
		    		console.log('店铺街出错',err);
			        // 网络请求超时或断网时 [TypeError: Network request failed]
					if(err.toString().indexOf('Network request failed')!=-1){
						Utils.msg('网络连接超时...');
						that.setState({
							isConnected:false
						});
					}
		      });
		})


	}
	//店铺搜索
	shopSearch(shopName){
		// 重置rowData
		this._data = [];
		// 将当前页置为1
		this.currPage = 0;
		// 记录搜索的名称
		this.setState({
			shopName:shopName
		});
		let sort = 0; 
		let desc = 0; 
		this.getShops(sort, desc,this.state.selectedValue,shopName);
	}
	//分类
	changeCats(value){
		let that = this;
		let _promise = new Promise((resolve, reject)=>{
			that.setState({selectedValue: value});
			resolve('cats');
		});
		_promise.then((val)=>{
			that.changeFilter('cats');
		}).catch((err)=>{
			console.log('promise执行失败',err);
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

		let sort = msort[val];
		let desc = !obj.arrow_up?0:1;

		this.getShops(sort,desc,this.state.selectedValue,this.state.shopName);
		this.setState(obj);
	}
	
	// 组件挂载完毕
	componentDidMount(){
		InteractionManager.runAfterInteractions(() => {
			// 检测网络状态
			NetInfo.isConnected.fetch().done((isConnected) => {
			  if(isConnected || global._platfrom=='ios'){
				this.getData();
				this.getShops();
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
			  this.getShops();
			}else{
			  // 当前无网络连接
			  this.setState({
				isConnected:false,
			  });
			}
		});
	  }
	
    // 渲染头部
    renderHeader(){
  	  return(<Header initObj={{backName:'',title:'店铺街'}} navigator={this.props.navigator} />);
    }
	//广告
	adsData(data,url){
		let ads = [];
		for(let s in data){
			ads.push(<Image key={s} source={{uri:url+data[s]['adFile']}} resizeMode={'center'} style={styles.buyingimg}/>);
		}
		return ads;
	}
	//分类
	catsData(data){
		let cat = [];
		cat.push(<Picker.Item  key="0" label="主营" value="0"/>);
		for(let c in data){
			cat.push(<Picker.Item  key={c} label={data[c]['catName']} value={data[c]['catId']}/>);
		}
		return cat;
	}
	//评分
	score(data){
		let sco = [];
		for(let sc=0; sc<data;sc++){
			sco.push(<Icon key={sc} name={'star'} size={10} color={'#d85600'}/>);
		}
		for(let sc=data; sc<5;sc++){
			sco.push(<Icon key={sc} name={'star-o'} size={10} color={'#d85600'}/>);
		}
		return sco;
	}
	//图标
	accreds(data,url){
		let acc = [];
		for(let a in data){
			acc.push(<Image key={a} source={{uri:url+data[a]['accredImg']}} style={styles.scoreimg}/>);
		}
		return acc;
	}
	renderListViewHead(){
		return(
			<View>
			{
        		(shopDatas!=undefined && shopDatas.data.swiper.length>0)
        		?
		         <View style={styles.titles}>
		             <View style={[styles.rec_title_box,styles.center,styles.row]}>
						<View style={styles.rec_title_line}></View>
						<Text style={styles.rec_title}>名铺
							<Text style={styles.bold}>抢购</Text>
						</Text>
						<View style={styles.rec_title_line}></View>
					</View>
		             <View style={styles.buying}>
			             <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
			             	{this.adsData(shopDatas.data.swiper,shopDatas.data.domain)}
			             </ScrollView>
		             </View>
	             </View>
        		:
        		null
        	}

	             <View style={styles.option}>
	             	{
	             		(global._platfrom=='ios')
	             		?
	             		<ShopStreetIosSelect 
	             			initVal={this.state.selectedValue}
	             		    selected={(value)=>{this.changeCats(value)}}
	             			data={shopDatas.data.goodscats}/>
	             		:
	             		<Picker style={[styles.frame,this.state.curr_cats_text]}
			                //显示选择内容
			                selectedValue={this.state.selectedValue}
			                //选择内容时调用此方法
				         	onValueChange={(value)=>{this.changeCats(value)}}
			                //设置Title 当设置为dialog时有用
			                prompt={'请选择'}
			              >
				          {shopDatas!=undefined?this.catsData(shopDatas.data.goodscats):null}
			              </Picker>
	             	}
		              <TouchableOpacity style={styles.evaluate} onPress={()=>this.changeFilter('sort')}><Text style={[styles.evaluatetext,this.state.curr_sort_text]}>好评度</Text>
						{
							(Object.keys(this.state.curr_sort)!='')?(
							(this.state.arrow_up)?
							<Arrowicon name={'arrow-upward'} size={20}/>
							:
							<Arrowicon name={'arrow-downward'} size={20} />
							)
							:
							<Arrowicon name={'arrow-downward'} size={20} />
						}
		              </TouchableOpacity>
	              </View>
              </View>
		);
	}
    
  render() {
  	if(!this.state.isConnected){
      return (
      	<View style={styles.container}>
      		<StatusBar backgroundColor='black' animated={true} Style="light-content" />
      		<Refresh refresh={this._onRefresh} />
      	</View>
      );
	}
	if(this.state.loading){
		return (
	    	<View style={styles.container}>
			{/* 搜索框 */}
			<Search 
				placeholder={'请输入店铺名称'}
				commit={this.shopSearch}
				navigator={this.props.navigator} />
		        <View style={styles.container}>
					  {Utils.loading()}
			    </View>
		    </View>
	    );
	}
    return (
    	<View style={styles.container}>
    		<StatusBar backgroundColor='black' animated={true} Style="light-content" />
		{/* 搜索框 */}
		<Search 
			placeholder={'请输入店铺名称'}
			commit={this.shopSearch}
			navigator={this.props.navigator} />
        <View style={styles.container}>
			  {
			  	this.state.hasShops
			  	?
			  	<ListView
					renderHeader={this.renderListViewHead}
					onEndReachedThreshold={300} 
					onEndReached ={(c)=>this.getShops()}
					dataSource={this.state.ds}
					renderRow={this._renderRow}
					refreshControl={ 
			          <RefreshControl
			            refreshing={this.state.isRefreshing}
			            onRefresh={this._onRefresh}
			            colors={['#00ff00', '#ff0000', '#0000ff']}/> 
			        }/>
			  	:
			  	<View style={styles.prompt}><Text style={{fontSize:20,fontWeight:'bold'}}>没有相关店铺</Text></View>
			  }
	    </View>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#eee',
   },
   row:{
   	flexDirection:'row'
   },
   center:{
   	justifyContent:'center',
   	alignItems:'center',
   },
   titles:{
	   width:Utils.width,
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
		color:'#333'
	},
	bold:{
		fontWeight:'bold',
	},
   buying:{
	   flex: 1,
	   paddingLeft:10,
	   paddingRight:10,
	   backgroundColor: '#ffffff',
	   marginBottom: 5
   },
   buyingimg:{
	   width:(Utils.width-20)*0.25,
	   height:(Utils.width-20)*0.3,
   },
   option:{
	   flex: 1,
	   flexDirection: 'row',
	   backgroundColor: '#ffffff',
	   marginTop: 3,
	   marginBottom: 3
   },
   frame:{
	   width:Utils.width*0.5,
	   alignItems: 'center',
   },
   evaluate:{
	   width:Utils.width*0.5,
	   flexDirection: 'row',
	   alignItems: 'center',
	   paddingLeft:10,
	   paddingRight:10
   },
   evaluatetext:{
	   flex: 1,
	   fontSize: 13,
	   color: '#333'
   },
   shop:{
	   padding:5,
	   paddingRight:15,
	   marginTop:5,
	   backgroundColor: '#ffffff',
   },
   shop_head:{
   		alignItems:'center',
   },
   shopl:{
	    width:Utils.width*0.106,
   },
   shopimg_box:{
   		marginLeft:10,
   		marginRight:10,
   },
   shopimg:{
	   width:parseInt(Utils.width*0.106),
	   height:parseInt(Utils.width*0.106),
	   borderRadius:parseInt(Utils.width*0.106*0.5),
	   overflow:'hidden',
   },
   shopr:{
	   flex:4,
	   paddingLeft:5
   },
   shopname:{
	   fontSize: 13,
	   color: '#333',
	   overflow:'hidden',
	   marginBottom:3,
   },
   shopinfo:{
   	   fontSize:10,
   	   color:'#666',
	   overflow:'hidden',
   },
   go_shop_box:{
   	 alignItems:'flex-end',
   	 flex:1,
   },
   go_shop:{
   	   color:'#d82a2e',
   	   fontSize:10,
   	   width:Utils.width*0.128,
   	   borderWidth:1,
   	   borderColor:'#d82a2e',
   	   borderRadius:Utils.width*0.128*0.2,
   	   textAlign:'center',
   	   paddingTop:3,
   	   paddingBottom:3,
   },
   shop_goods:{
   		marginTop:2,
		flex:1,
		flexDirection:'row',
		backgroundColor:'#fff',
		paddingLeft:7,
	},
	rec_item:{
		marginRight:8,
		width:Utils.width*0.3,
	},
	rec_img:{
		position:'relative',
		width:Utils.width*0.3,
		height:Utils.width*0.3,
	},
	rec_price:{
		position:'absolute',
		left:0,
		bottom:0,
		backgroundColor:'rgba(255,255,255,0.6)',
		width:Utils.width*0.3,
	},
	rec_text:{
		paddingRight:10,
		width:Utils.width*0.3,
		textAlign:'right',
		color:'#333',
		fontSize:11,
	},

   scoreimg:{
	   width:(Platform.OS=='ios')?Utils.height*0.03:Utils.width*0.13,
	   height:(Platform.OS=='ios')?Utils.height*0.03:Utils.width*0.13
   },
   prompt:{
	   paddingTop:80,
	   alignItems: 'center'
   }
});