/**
* 卖货商关系管理
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
  RefreshControl,
  NetInfo,
  Image,
  InteractionManager,
  TouchableOpacity
} from 'react-native';

// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
let {width,height} = Utils;
import Relationship from './relationship';
import OrderList from './order_list';
import SharerMoney from './sharer_money';
import SharerShop from './../../sharer_shop/sharer_shop';
import SharerArea from './sharer_area';
export default class DistributeManager extends Component {
	constructor(props){
		super(props);
	}
  // 组件挂载完毕
  componentDidMount(){}
  // 渲染头部
  renderHeader(){
	  return(<Header 
	  		initObj={{backName:'',title:'卖货管理'}} 
	  		backEvent={()=>{this.props.navigator.pop()}}/>);
  }
  render(){
    return (
    	<View style={styles.container}>
    		{this.renderHeader()}
    		<View>
				{
					global.shareInfo!=undefined && global.shareInfo.shareRank==3
					?
					<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.props.navigator.push({component:SharerShop,passProps:{shareId:global.shareInfo.userId}})}>
						<View style={[styles.row,styles.a_center]}>
							<Image source={require('./../../img/sharer_shop.png')} style={styles.img} />
							<Text style={styles.c14_333}>虚拟店铺</Text>
						</View>
						<Text style={styles.right_icon}> > </Text>
					</TouchableOpacity>
					:
					null
				}

    			<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.props.navigator.push({component:OrderList})}>
					<View style={[styles.row,styles.a_center]}>
						<Image source={require('./../../img/sharer_order.png')} style={styles.img} />
						<Text style={styles.c14_333}>订单管理</Text>
					</View>
    				<Text style={styles.right_icon}> > </Text>
    			</TouchableOpacity>
    			<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.props.navigator.push({component:Relationship,passProps:{
    				_title:'卖货商关系',
    				shareRankId:this.props.shareRank,
    			}})}>
					<View style={[styles.row,styles.a_center]}>
						<Image source={require('./../../img/sharer_relationship.png')} style={styles.img} />
						<Text style={styles.c14_333}>关系管理</Text>
					</View>
    				<Text style={styles.right_icon}> > </Text>
    			</TouchableOpacity>
    			<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.props.navigator.push({component:SharerMoney})}>
					<View style={[styles.row,styles.a_center]}>
						<Image source={require('./../../img/sharer_money.png')} style={styles.img} />
						<Text style={styles.c14_333}>分佣管理</Text>
					</View>
    				<Text style={styles.right_icon}> > </Text>
    			</TouchableOpacity>
				<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.props.navigator.push({component:SharerArea})}>
					<View style={[styles.row,styles.a_center]}>
						<Image source={require('./../../img/sharer_area.png')} style={styles.img} />
						<Text style={styles.c14_333}>卖货商区域</Text>
					</View>
    				<Text style={styles.right_icon}> > </Text>
    			</TouchableOpacity>
    		</View>
    	</View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor:'#fff',
   },
   a_center:{alignItems:'center'},
   center:{
		justifyContent:'center',
		alignItems:'center',
	},
	row:{flexDirection:'row'},
	item:{
   	  backgroundColor:'#fff',
   	  justifyContent:'space-between',
   	  alignItems:'center',
   	  padding:5,
   	  paddingLeft:15,
   	  paddingRight:15,
   	  borderBottomWidth:1,
   	  borderBottomColor:'#eee'
   },
   c14_333:{
   	fontSize:14,
   	color:'#333'
   },
   right_icon:{
   	fontSize:18
   },
   img:{
	width:20,
	height:20,
	marginRight:5
   }
});