/**
* 设置
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
import Refresh from './../common/refresh';
//引入公共头部
import Header from './../common/header';
//工具类
import Utils from './../common/utils';
// 账户管理
import UserEdit from './useredit/edit';
// 关于
import About from './about.js';


export default class UserSet extends Component {
	constructor(props){
		super(props);
		this.logout = this.logout.bind(this);
	}
	// 用户注销
	logout(){
		let that = this;
		// 请求服务器
		global.storage.load({key:'tokenId'}).then(ret => {
			let url = Utils.domain+'app/users/logout';
			let tokenId = ret;
			postData = {tokenId:tokenId};
			Utils.post(url,
				   postData,
				   (responData)=>{
				   		if(responData.status==1){
				   			// 删除tokenId
				   			global.storage.remove({key:'tokenId'});

				   			global.isLogin = false;

				   			global.tokenId = false;

				   			global.shareInfo = undefined;

				   			// 跳回到登录页
				   			//that.props.navigator.replace({component:Login});
				   			// 选中home、弹出到最顶层
				   			that.props.click('home');
				   			that.props.navigator.popToTop();
				   		}
				   },
				   (err)=>{
				   		console.log(err);
				   });
		}).catch(err => {
			console.log(err);
		});
		
		
	}
	
  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'设置',title:' '}} navigator={this.props.navigator} />);
  }
  // 清除缓存
  clearCache(){
  	global.storage.remove({key: 'goodsType'});// 清除商品分类缓存
  	global.storage.remove({key: 'indexData'});// 清除首页缓存
  	global.storage.clearMapForKey('pregoods');// 清除商品缓存(第一屏,只有图片及名称的缓存)
  	global.storage.clearMapForKey('goods');// 清除商品缓存
  	global.storage.remove({key: 'shopStreetFilter'});// 清除店铺街筛选条件缓存
  	alert('清除成功');
  }
		
  render() {
    	return(
    		<View style={styles.container}>
	    		{this.renderHeader()}
	    		<ScrollView style={[styles.flex_1,{paddingTop:10}]}>
	    			<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.props.navigator.push({component:UserEdit})}>
	    				<Text style={styles.c13_333}>账户管理</Text>
	    				<Text style={styles.right_icon}> > </Text>
	    			</TouchableOpacity>
	    			<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.props.navigator.push({component:About})}>
	    				<Text style={styles.c13_333}>关于</Text>
	    				<Text style={styles.right_icon}> > </Text>
	    			</TouchableOpacity>
	    			<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.clearCache()}>
	    				<Text style={styles.c13_333}>清除缓存</Text>
	    				<Text style={styles.right_icon}> > </Text>
	    			</TouchableOpacity>

	    			<View style={styles.out}>
						<TouchableOpacity onPress={this.logout} style={styles.landout}><Text style={styles.landouts}>退出登陆</Text></TouchableOpacity>
					</View>

	    		</ScrollView>
	    	</View>
    	);
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#eee',
   },
   flex_1:{
   	   flex:1,
   },
   c13_333:{
   	fontSize:13,
   	color:'#333'
   },
   right_icon:{
   	fontSize:18
   },
   row:{
   	flexDirection:'row'
   },
   center:{
   	justifyContent:'center',
   	alignItems:'center'
   },
   item:{
   	  backgroundColor:'#fff',
   	  justifyContent:'space-between',
   	  alignItems:'center',
   	  paddingVertical:10,
   	  paddingHorizontal:15,
   	  borderBottomWidth:1,
   	  borderBottomColor:'#eee'
   },
   out:{
	  marginTop: 60,
	  marginBottom:20,
	  alignItems: 'center',
	  overflow:'hidden',
  },
  landout:{
	  width: 160,
	  paddingVertical:10,
	  borderRadius:5,
	  backgroundColor: '#e00102',
	  
  },
  landouts:{
	  color: '#ffffff',
	  textAlign: 'center',
  }
});