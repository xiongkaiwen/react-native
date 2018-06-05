/**
* 我的关注商品
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
  Platform,
  InteractionManager,
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
//引入checkbox组件
import CheckBox from '../../common/checkbox';
// 商品详情页
import GoodsDetail from './../../goods/goods_detail';
export default class FavoriteGoods extends Component {
  constructor(props){
	    super(props);
	    this.CheckBoxData=[];
	    this.state={};
	    // 是否有网络
		this.state.isConnected = true;
		this.first = true;
		this.status = true;
		// 数据
	    var favGoods = {};
		// 是否有数据
		this.state.hasData = false;
		// 是否加载数据
		this.state.loadData = false;
		// 全选状态
		this.state.all = false;
		// 绑定this
		this.success = this.success.bind(this);
		this.toPopup = this.toPopup.bind(this);
		this.addCart = this.addCart.bind(this);
		this.cancelFollow = this.cancelFollow.bind(this);
		this._onRefresh = this._onRefresh.bind(this);

  }
  componentWillUnmount(){
  	this._isMounted = false;
  }
  //请求成功的回调方法
	success(data){
	favGoods = data;
	if(favGoods.data.list.length>0){
		if(!this._isMounted)return;
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
	componentWillReceiveProps(nextProps){
		this.getTypeData();
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
		var data = favGoods.data.list;
		for(let i in data){
			if(data[i].favoriteId==cId){
				data[i].isCheck = (typeof(status)!="undefined")?status:!data[i].isCheck;
				break;
			}
		}
	}
	//加入购物车
	addCart(id){
		let that = this;
		if(id==''){
			Utils.msg('请选择商品加入购物车');
			return;
		}
		
		// 请求接口
		Utils.post(Utils.domain+'app/carts/addCart',
			{tokenId:global.tokenId,goodsId:id,buyNum:1},
			function(responData){
				if(responData.status==1){
					Utils.msg(responData.msg);
				}else{
					Utils.msg(responData.msg);
				}
			},
			function(err){
				Utils.msg('取消失败');
			});
	}
	
	
  listData(){
	  var data = favGoods.data.list;
	  var listPannel = [];
	  for(let i in data){
		  let list =  <View key={data[i]['favoriteId']} style={styles.goods}>
					       	  <View style={styles.goodsl}>
						          <CheckBox
						             ref={(c)=>this.initCheckBoxData(data[i]['favoriteId'],c)}
						             label=""
									 size={17}
						             checked={data[i].isCheck?true:false}
						             value={data[i]['favoriteId']}
						             onChange={(checked) => this.checkSelect(checked,data[i]['favoriteId'])} />
							  </View>
				              <TouchableOpacity style={styles.goodsi} onPress={()=>this.viewGoodsDetail(data[i]['goodsId'])}>
						  		  <Image source={{uri:favGoods.data.domain+data[i]['goodsImg']}} style={styles.goodsimg}/>
							  </TouchableOpacity>
						      <View style={styles.goodsr}>
							      <TouchableOpacity onPress={()=>this.viewGoodsDetail(data[i]['goodsId'])}>
							      <Text style={[styles.goodsname,styles.c13_333]}>{data[i]['goodsName']}</Text></TouchableOpacity>
							      <View style={styles.goods_bottom}>
								      <Text style={styles.price}>￥{data[i]['shopPrice']}</Text>
								      <Text style={styles.cart} onPress={()=>this.addCart(data[i]['goodsId'])}>
								      	<Image source={require('../../img/icon_gzspcart.png')} style={styles.add_cart}/>
								      </Text>
							      </View>
							  </View>
						  </View>;
		 listPannel.push(list);  
	  }
	  return listPannel;
  }
  // 获取数据
  getTypeData(){
  	let that = this;
	//  清空chkbox重新存储chk对象
	that.CheckBoxData.splice(0, that.CheckBoxData.length);
	that.first = true;
    Utils.get(Utils.domain+'app/favorites/listGoodsQuery?tokenId='+global.tokenId,this.success,function(err){
    			console.log('关注商品页面出错',err);
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
  	this._isMounted = true;
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
  
  // 渲染头部
  renderHeader(){
	  return(<Header 
	  			style={{backgroundColor:'#F61628'}}
	  			leftStyle={{borderColor:'#fff'}}
	  			titleTextStyle={{color:'#fff'}}
	  			initObj={{backName:'',title:'关注'}} 
	  			navigator={this.props.navigator} />);
  }
  render() {
  	// 没有网络
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	// 请求数据中
	if(!this.state.loadData){
		return (
				<View style={styles.container}>
					{this.renderHeader()}
					{Utils.loading()}
				</View>
				)
	}
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
					<TouchableOpacity onPress={this.toPopup}><Text style={styles.button}>取消关注 </Text></TouchableOpacity>
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
					this.editChkStatus(cId, that.status);
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
			Utils.msg('请选择要取消关注的商品');
			return;
		}
		
		// 请求接口
		Utils.post(Utils.domain+'app/favorites/cancel',
			{tokenId:global.tokenId,id:id,type:0},
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
			<View style={styles.container}>
				{this.renderHeader()}
				<View style={[styles.center,{height:Utils.height-165}]}>
					<Image 
						source={require('./../../img/favorite_empty.png')} 
						resizeMode={'cover'} 
						style={{width:Utils.width*0.3,height:Utils.width*0.3*0.863}} />
					<Text style={[styles.empty_text]}>
						亲 暂时还没有关注的商品哦
						{'\r\n'}
						快去逛逛吧~
					</Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
  container: {
	  flex: 1,
	  backgroundColor: '#eee'
  },
  center:{
  	justifyContent:'center',
  	alignItems:'center'
  },
  c13_333:{
  	fontSize:13,
  	color:'#333',
  },
  empty_text:{
		fontSize:15,
		color:'#666',
		marginTop:40,
		paddingLeft:15,
		textAlign:'center',
	},
  goods:{
	  flex: 1,
	  flexDirection: 'row',
	  marginTop: 5,
	  padding:5,
	  paddingLeft:10,
	  paddingRight:10,
	  backgroundColor: '#ffffff',
  },
  goodsl:{
	  width: Utils.width*0.1,
	  paddingTop:32
  },
  goodsi:{
	  width: Utils.width*0.29,
	  padding:2
  },
  goodsr:{
	  width: Utils.width*0.56,
	  flexDirection: 'column',
	  position: 'relative'
  },
  goods_bottom:{
  	flexDirection:'row',
  	justifyContent:'space-between',
  	alignItems:'center',
  },
  goodsimg:{
	  width: Utils.width*0.25,
	  height: Utils.width*0.25
  },
  add_cart:{
  	width: (Platform.OS=='ios')?Utils.height*0.035:Utils.width*0.17,
	height: (Platform.OS=='ios')?Utils.height*0.035:Utils.width*0.16
  },
  goodsname:{
  	  flex:1,
  	  marginBottom:Utils.height*0.055,
  	  overflow:'hidden'
  },
  price:{
	  color: '#d82a2e',
	  fontSize:13,
  },
  cart:{

  },
  prompt:{
	  flex: 1,
	  marginTop: 80,
	  alignItems: 'center'
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
	   width:90,
	   padding:10,
	   backgroundColor: '#d82a2e',
  }
});