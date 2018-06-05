/**
* 品牌街
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './common/refresh';
//工具类
import Utils from './common/utils';
//商品列表页
import GoodsList from './goods/goods_list';

export default class Brands extends Component {
	constructor(props){
		super(props);
		this.state={};
		// 是否有网络
		this.state.isConnected = true;
		// 数据
	    var brandsData = {};
		// 是否有数据
		this.state.hasData = false;
		// 是否加载数据
		this.state.loadData = false;
		
		this.success = this.success.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	brandsData = data;
	if(brandsData.data.list.length>0){
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
	    Utils.get(Utils.domain+'app/brands/pageQuery',this.success,function(err){
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
  //列表
  listData(){
	  var data = brandsData.data.list;
	  var listPannel = [];
	  for(let i in data){
		  let list = <TouchableOpacity 
		  				 key={i} 
		  				 style={styles.brands} 
		  				 onPress={()=>this.props.navigator.push({component:GoodsList,passProps:{brandId:data[i]['brandId']}})}>
				  		 <Image 
					  		 source={{uri:brandsData.data.domain+data[i]['brandImg']}} 
					  		 style={styles.brandimg} 
					  		 resizeMode={'center'}/>
				  		 <Text style={styles.brandname}>{data[i]['brandName']}</Text>
			  		 </TouchableOpacity>;
		 listPannel.push(list);  
	  }
	  return listPannel;
  }
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	// 没有数据
	if(!this.state.hasData){
		return this.empty();
	}
	
	let list = this.listData();
    return (
    	<View style={styles.container}>
        <ScrollView>
	         <View style={styles.brand}>
	         	{list}
	         </View>
	    </ScrollView>
	    </View>
    );
  }
	// 数据为空
	empty(){
		return(
			<View style={styles.contrainer}>
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}><Text style={{fontSize:20,fontWeight:'bold'}}>没有品牌。</Text></View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#fff',
   },
   brand:{
   	   width:Utils.width,
	   flexDirection:'row',
	   flexWrap:'wrap',
	   justifyContent:'flex-start'
   },
   brands:{
	   marginTop: 10,
	   width: Utils.width*0.3,
	   marginLeft:Utils.width*0.025,
	   backgroundColor: '#ffffff',
	   justifyContent:'center',
   },
   brandimg:{
	   width: Utils.width*0.28,
	   height:Utils.width*0.28,
   },
   brandname:{
	   overflow:'hidden',
	   textAlign:'center',
	   color:'#050101',
	   fontSize: 11
   }
});