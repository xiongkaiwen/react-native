/**
* 浏览记录
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  InteractionManager
} from 'react-native';

//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
//商品详情页
import GoodsDetail from './../../goods/goods_detail';

export default class History extends Component {
	constructor(props){
		super(props);
		this.state={};
		// 数据
	    var historyData = {};
		// 是否有数据
		this.state.hasData = false;
		// 是否加载数据
		this.state.loadData = false;
		
		this.success = this.success.bind(this);
	}
	//请求成功的回调方法
	success(data){
	historyData = data;
	if(historyData.data.list.length>0){

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

 // 获取数据
  getData(){
  	let that = this;
  	global.storage.load({
      key: 'history'
    }).then(val => {
      that._getData(val);
    }).catch(err => {
       that._getData();
    });
  }
  _getData(history){
  	Utils.get(Utils.domain+'app/goods/historyQuery?tokenId='+global.tokenId+'&history='+history,this.success,function(err){
  		  alert('请求数据失败：');
		  console.log('浏览记录报错'+err);
		});
  }
  // 组件挂载完毕
  componentDidMount(){
  	InteractionManager.runAfterInteractions(() => {
	    // 调用方法请求数据
	    this.getData();
  	});
  }
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:'浏览记录'}} navigator={this.props.navigator} />);
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
  
  //列表
  listData(){
	  var data = historyData.data.list;
	  var listPannel = [];
	  for(let i in data){
		  let list = <View key={data[i]['goodsId']} style={styles.goods}>
				       	<TouchableOpacity style={styles.goodsl} onPress={()=>this.viewGoodsDetail(data[i]['goodsId'])}>
				       		<Image source={{uri:historyData.data.domain+data[i]['goodsImg']}} style={styles.goodsimg}/>
				       	</TouchableOpacity>
				     	<View style={styles.goodsr}>
				     		<TouchableOpacity onPress={()=>this.viewGoodsDetail(data[i]['goodsId'])}>
				     			<Text numberOfLines={2} style={styles.nmae}>{data[i]['goodsName']}</Text>
				     		</TouchableOpacity>
				     		<View style={styles.goods_price}>
					     		<Text style={styles.price}>￥{data[i]['shopPrice']}</Text>
					     		<Text style={styles.deal}>成交数:{data[i]['saleNum']}</Text>
				     		</View>
				     	</View>
				 	</View>;
		 listPannel.push(list);  
	  }
	  return listPannel;
  }
		
  render() {
	// 请求数据中
	/*if(!this.state.loadData){
		return Utils.loading();
	}*/
	// 没有数据
	if(!this.state.hasData){
		return this.empty();
	}
	
	let list = this.listData();
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
        	{list}
	    </ScrollView>
	    </View>
    );
  }
  
	// 数据为空
	empty(){
		return(
			<View style={styles.contrainer}>
				{this.renderHeader()}
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}><Text style={{fontSize:20,fontWeight:'bold'}}>没有浏览记录。</Text></View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
	   paddingBottom:10,
   },
   goods:{
   	   marginTop:10,
	   paddingLeft:10,
	   backgroundColor: '#ffffff',
	   flexDirection: 'row'
   },
   goodsl:{
	   width: Utils.width*0.32
   },
   goodsimg:{
	   width: Utils.width*0.32,
	   height: Utils.width*0.32
   },
   goodsr:{
	   flex: 1,
	   borderBottomWidth:1,
   	   borderColor:'#eee',
   	   paddingRight:10,
   	   paddingBottom:10,
   },
   nmae:{
   	   marginTop:10,
   	   marginLeft:10,
	   overflow:'hidden',
	   fontSize:13,
	   color:'#333',
   },
   goods_price:{
   		flexDirection:'row',
   		alignItems:'flex-end',
   		justifyContent:'space-between',
   		flex:1,
   },
   price:{
	   color: '#d82a2e',
	   fontSize:13,
   },
   deal:{
	   color: '#666',
	   fontSize:9,
   }
});