import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
// navBar
import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view';

//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';
// 订单列表组件
import OrderListComponent from './orders_list_component';

export default class OrderList extends Component{
	constructor(props){
		super(props);
		this.state = {};
	}
	render(){
		return(
			<View style={[styles.contrainer,styles.flex_1]}>
				{/* 头部 */}
				<Header initObj={{backName:' ',title:' 我的订单'}} 
					backEvent={()=>this.props.navigator.pop()}/>

				 	<ScrollableTabView
				 	  locked={true}
				 	  initialPage={this.props.defaultPage}
				      renderTabBar={() => <DefaultTabBar 
				      						style={styles.tab} 
				      						tabStyle={styles.tabStyle} 
				      						underlineStyle={styles.tabUnderline} 
				      						activeTextColor={'#d82a2e'} 
				      						textStyle={{fontWeight:'normal',fontSize:13}} 
				      						inactiveTextColor={'#333'} />}
				      ref={(tabView) => { this.tabView = tabView; }}>

					  <OrderListComponent tabLabel='全部' type={'all'} navigator={this.props.navigator} />

					  <OrderListComponent tabLabel='待付款' type={'waitPay'} navigator={this.props.navigator} />

				      <OrderListComponent tabLabel='待发货' type={'waitDelivery'} navigator={this.props.navigator} />

				      <OrderListComponent tabLabel='待收货' type={'waitReceive'} navigator={this.props.navigator} />

				      <OrderListComponent tabLabel='已完成' type={'finish'} navigator={this.props.navigator} />

				      <OrderListComponent tabLabel='取消拒收' type={'abnormal'} navigator={this.props.navigator} />

				    </ScrollableTabView>

					
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
	text:{
		fontSize:20,
		fontWeight:'bold'
	},
	row:{flexDirection:'row'},
	// tab样式
	tab:{
		height:30,
		backgroundColor:'#fff'
	},
	tabStyle:{
		paddingTop:5,
	},
	tabUnderline:{
		backgroundColor:'#d82a2e',
		height:1
	},
	main:{
		height:height-50,
	},
});