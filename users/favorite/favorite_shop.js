/**
* 我的关注店铺
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  NetInfo,
  InteractionManager
} from 'react-native';
//图标组件
import Icon from 'react-native-vector-icons/FontAwesome';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
//引入checkbox组件
import CheckBox from '../../common/checkbox';
//店铺详情
import ShopHome from '../../shop_home';
//商品详情页
import GoodsDetail from './../../goods/goods_detail';


export default class FavoriteShop extends Component {
  constructor(props){
	    super(props);
	    this.CheckBoxData = [];
		this.status = true;
		//标记
		this.first = true;

	    this.state={};
	    // 是否有网络
		this.state.isConnected = true;
		// 数据
	    var favShops = {};
		// 是否有数据
		this.state.hasData = false;
		// 是否加载数据
		this.state.loadData = false;
		// 全选状态
		this.state.all = false;
		// 绑定this
		this.success = this.success.bind(this);
		this.toPopup = this.toPopup.bind(this);
		this.cancelFollow = this.cancelFollow.bind(this);
		this._onRefresh = this._onRefresh.bind(this);

  }
  componentWillReceiveProps(nextProps){
		this.getTypeData();
	}
  //请求成功的回调方法
	success(data){
	favShops = data;
	if(favShops.data.list.length>0){
		this.setState({
			loadData:true,
		    hasData:true,
		  });
		}else{
			this.setState({
				loadData:true,
			 });
		}
	}
	// 获取checkbox实例对象
	initCheckBoxData(cId,val){
		let that = this;
		if(that.first && val!=null){
			let index = 'chk_'+cId;
			that.CheckBoxData.push({[index]:val});
		}
	}
	componentDidUpdate(){
		this.first = false;
	}
	// 选择复选框时触发
	checkSelect(chk,val){
		this.editChkStatus(val);
	}
	// 修改原始数据中的isCheck
	editChkStatus(cId,status){
		var data = favShops.data.list;
		for(let i in data){
			if(data[i].favoriteId==cId){
				data[i].isCheck = (typeof(status)!="undefined")?status:!data[i].isCheck;
				break;
			}
		}
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
	  listData(){
		  var data = favShops.data.list;
		  var listPannel = [];
		  for(let i in data){
			  let list = <View key={data[i]['favoriteId']} style={styles.shop}>
					         	<View style={styles.shopt}>
					         	<View style={styles.shopl}>
						           <CheckBox
						             ref={(c)=>this.initCheckBoxData(data[i]['favoriteId'],c)}
						             label=""
									 size={17}
						             checked={data[i].isCheck?true:false}
						             value={data[i]['favoriteId']}
						             onChange={(checked) => this.checkSelect(checked,data[i]['favoriteId'])} />
				  				</View>
								<TouchableOpacity style={styles.shopi} onPress={()=>this.props.navigator.push({component:ShopHome,passProps:{shopId:data[i]['shopId']}})}>
									<Image source={{uri:favShops.data.domain+data[i]['shopImg']}} style={styles.shopimg}/>
								</TouchableOpacity>
						        <View style={styles.shoprl}>
						        	<Text style={styles.shopname}>{data[i]['shopName']}</Text>
						        	<Text numberOfLines={1} style={styles.c11_666}>主营：{data[i]['shopCat']}</Text>
						        	<Text numberOfLines={1} style={styles.c11_666}>店铺评分：{this.score(data[i]['totalScore'])}</Text>
					  			</View>
						        <View style={styles.shoprr}>
						        	<TouchableOpacity style={[styles.go_shop_box]} onPress={()=>this.props.navigator.push({component:ShopHome,passProps:{shopId:data[i]['shopId']}})}>
						      	  	 	<Text style={[styles.go_shop]}>进店逛</Text>
						      	  	 </TouchableOpacity>
					        	</View>
				  			</View>
				  			<View style={styles.shopb}>
				  			<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
				  				{this.listGoods(data[i]['goods'],favShops.data.domain)}
				  			</ScrollView>
				  			</View>
				  		</View>;
			 listPannel.push(list);  
		  }
		  return listPannel;
	  }
	
	listGoods(data,url){
		let goods = [];
		for(let s in data){
			goods.push(
				<TouchableOpacity key={data[s]['goodsId']} style={styles.goods} onPress={()=>this.viewGoodsDetail(data[s]['goodsId'])}>
					<Image source={{uri:url+data[s]['goodsImg']}} style={styles.goodsimg}/>
					<View style={styles.price_box}>
						<Text style={styles.price}>￥{data[s]['shopPrice']}</Text>
					</View>
				</TouchableOpacity>);
		}
		return goods;
	}
	
  // 获取数据
  getTypeData(){
  	let that = this;
	//  清空chkbox重新存储chk对象
	that.CheckBoxData.splice(0, that.CheckBoxData.length);
	that.first = true;
    Utils.get(Utils.domain+'app/favorites/listShopQuery?tokenId='+global.tokenId,this.success,function(err){
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
  	InteractionManager.runAfterInteractions(() => {
	  	// 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
		  if(isConnected || global._platfrom=='ios'){
			// 调用方法请求数据
	    	this.getTypeData();
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
		  this.setState({
			isConnected:true,
			loadData:false
		  });
		  this.getTypeData();
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
	  return(<Header initObj={{backName:'',title:'关注店铺'}} navigator={this.props.navigator} />);
  }
	  
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	/*// 请求数据中
	if(!this.state.loadData){
		return Utils.loading();
	}*/
	// 没有数据
	if(!this.state.hasData){
		return this.empty();
	}
	
	let list = this.listData();
    return (
    	<View  style={styles.container}>
	    	{this.renderHeader()}
	    	<ScrollView>
	    		{list}
		    </ScrollView>
			<View style={styles.bottom}>
		 		<View style={[styles.bottoml]}>
				 	<CheckBox
				     ref={(c)=>this.initCheckBoxData(0,c)}
				     label="全选"
				     size={17}
				     labelStyle={{fontSize:15,color:'#838383'}}
				     checked={this.state.all}
				     value={''}
				     onChange={this.SelectAll.bind(this)} />
				 </View>
				<View style={styles.bottomr}>
					<TouchableOpacity onPress={this.toPopup}><Text style={styles.button}>取消关注</Text></TouchableOpacity>
				</View>
			</View>
	    </View>
    );
  }
	// 全选
	SelectAll(){
		let that = this;
		let ids = [];
		// 设置每个chk的状态值
		for (let i in that.CheckBoxData) {
			// 获取key
			let key = Object.keys(that.CheckBoxData[i])[0];
			// 获取cartId
			let cId = key.split('_')[1];
			let obj = that.CheckBoxData[i][key];
			if(that.CheckBoxData[i]!=null){
				if(that.status){
					obj.onChange(true)
				}else{
					obj.onChange(false)
				}
				if(cId>0){
					let isCheck = that.status?1:0;
					ids.push(cId);
					this.editChkStatus(cId,that.status);
				}
			}
		}
		this.setState({
			all:that.status
		});
		that.status = !that.status;
	}
	//取消关注
	toPopup(){
		let that = this;
		Alert.alert(
			'提示',//弹出框标题
            '确认要取消关注吗',//弹出框内容
            // 按钮设定
            [
              {text: '确定', onPress:that.cancelFollow},
              {text: '取消'},
            ]
		);
	}
	cancelFollow(){
		let that = this;
		let checked = [];
		for (let i in that.CheckBoxData) {
			// 获取key
			let key = Object.keys(that.CheckBoxData[i])[0];
			// 获取cartId
			let cId = key.split('_')[1];
			let obj = that.CheckBoxData[i][key];
			if(that.CheckBoxData[i]!=null){
				obj.state.checked?checked.push(obj.props.value):null;
			}
		}
		let id = checked.join(',');
		if(id==''){
			Utils.msg('请选择要取消关注的店铺');
			return;
		}
		// 请求接口
		Utils.post(Utils.domain+'app/favorites/cancel',
			{tokenId:global.tokenId,id:id,type:1},
			function(responData){
				if(responData.status==1){
					Utils.msg('取消成功');
					// 重新请求数据渲染页面
					that.getTypeData();
				}else{
					Utils.msg('取消失败');
				}
			},
			function(err){
				Utils.msg('取消失败');
			});
	}
	// 数据为空
	empty(){
		return(
			<View style={styles.contrainer}>
				{this.renderHeader()}
				<View style={[styles.center,{height:Utils.height-100}]}>
					<Image source={require('./../../img/favorite_empty.png')} resizeMode={'cover'} style={{width:Utils.width*0.25,height:Utils.width*0.25*0.863}} />
					<Text style={[styles.empty_text]}>亲 暂时还没有关注的店铺哦</Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
  container: {
	  flex: 1,
	  backgroundColor: '#f6f6f8',
  },
  center:{
  	justifyContent:'center',
  	alignItems:'center'
  },
  c11_666:{
  	marginTop:5,
  	fontSize:11,
  	color:'#666'
  },
  empty_text:{
		fontSize:16,
		color:'#d82a2e',
		marginTop:30,
		paddingLeft:15
	},
  shop:{
	  flex: 1,
	  marginTop: 5,
	  padding:5,
	  paddingLeft:10,
	  paddingRight:10,
	  backgroundColor: '#ffffff',
  },
  shopl:{
	  width: Utils.width*0.1,
	  paddingTop:28
  },
  shopt:{
	  flex: 1,
	  flexDirection: 'row'
  },
  shopi:{
	  width: Utils.width*0.25,
	  padding:2
  },
  shoprl:{
	  width: Utils.width*0.39,
	  position: 'relative',
  },
  shoprr:{
  	  flex:1,
  },
  go_shop_box:{
   	 flex:1,
   	 justifyContent:'center',
	  alignItems:'flex-end'
   },
   go_shop:{
   	   color:'#d82a2e',
   	   fontSize:10,
   	   width:Utils.width*0.128,
   	   borderWidth:1,
   	   borderColor:'#d82a2e',
   	   borderRadius:Utils.width*0.128*0.3,
   	   textAlign:'center',
   	   paddingTop:3,
   	   paddingBottom:3,
   },
  toshop:{
  	  fontSize:11,
  	  color:'#999',
	  textAlign: 'right'  
  },
  shopimg:{
	  width: Utils.width*0.2,
	  height: Utils.width*0.2,
	  borderRadius:Utils.width*0.2*0.5,
  },
  shopname:{
  	  marginTop:5,
	  fontSize: 13,
	  color: '#666',
  },
  shopb:{
	  flex: 1,
	  marginTop: 5,
	  flexDirection: 'row',
  },
  goods:{
  	  position:'relative',
	  marginLeft: 5,
  },
  price_box:{
  	position:"absolute",
  	bottom:0,
  	width:(Utils.width-10)*0.23,
  	backgroundColor:'rgba(255,255,255,0.6)',
  },
  goodsimg:{
	  width: (Utils.width-10)*0.23,
	  height: (Utils.width-10)*0.23
  },
  price:{
	  textAlign: 'center',
	  color: '#d82a2e',
	  fontSize:12,
  },
  bottom:{
	  height:40,
	  flexDirection: 'row',
	  borderTopColor: '#e8e8e8',
	  borderTopWidth:0.5,
	  backgroundColor: '#ffffff',
	  paddingLeft:10,
  },
  bottoml:{
	  flex: 1,
	  paddingTop:12
  },
  bottomr:{
	  flex: 1,
	  alignItems: 'flex-end',
  },
  button:{
	   color: '#ffffff',
	   textAlign: 'center',
	   padding:10,
	   width:90,
	   backgroundColor: '#d82a2e',
  }
});