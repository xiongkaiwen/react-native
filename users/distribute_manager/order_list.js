import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  InteractionManager
} from 'react-native';
// navBar
import ScrollableTabView, {DefaultTabBar,ScrollableTabBar} from 'react-native-scrollable-tab-view';

//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';
// 订单列表组件
import OrderListComponent from './orders_list_component';

export default class OrderListManager extends Component{
	constructor(props){
		super(props);
		this.state = {};
		this.state.loading = true;
	}
	// 组件挂载完毕
	componentDidMount(){
		InteractionManager.runAfterInteractions(() => {
	    	this.setState({loading:false});
	    });	
	}
	render(){
		if(this.state.loading){
			return(
				<View style={styles.contrainer}></View>
			);
		}
		return(
			<View style={[styles.contrainer,styles.flex_1]}>
				{/* 头部 */}
				<Header initObj={{backName:' ',title:' 订单管理'}} 
					backEvent={()=>this.props.navigator.pop()}/>

				 	<ScrollableTabView
				 	  locked={true}
				 	  scrollWithoutAnimation={true}
				 	  initialPage={this.props.defaultPage}
				      renderTabBar={() => <ScrollableTabBar 
				      						style={styles.tab} 
				      						tabStyle={styles.tabStyle} 
				      						underlineStyle={styles.tabUnderline} 
				      						activeTextColor={'#d82a2e'} 
				      						textStyle={{fontWeight:'normal',fontSize:13}} 
				      						inactiveTextColor={'#333'} />}
				      ref={(tabView) => { this.tabView = tabView; }}>



					  <OrderListComponent tabLabel='全部' orderState={0} navigator={this.props.navigator} />

					  <OrderListComponent tabLabel='已完成交易' orderState={1} navigator={this.props.navigator} />

				      <OrderListComponent tabLabel='未完成交易' orderState={-1} navigator={this.props.navigator} />

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
		height: 30,
	    alignItems: 'center',
	    justifyContent: 'center',
	    paddingLeft: 10,
	    paddingRight: 10,
	},
	tabUnderline:{
		backgroundColor:'#d82a2e',
		height:1
	},
	main:{
		height:height-50,
	},
});