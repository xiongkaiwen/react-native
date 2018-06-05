/**
* 我的余额
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  NetInfo,
  InteractionManager
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
// 提现
import DrawCash from './withdrawals';
// 资金流水
import MoneyRecord from './money_record';
// 提现账户
import CashConfigsList from './cashconfigs_list';
let {width,height} = Utils;
export default class MyMoney extends Component{
	constructor(props){
		super(props);
		this.state = {
			userMoney:'0.00',// 用户余额
		}
	}
	componentWillReceiveProps(){
		console.log('刷新用户余额');
		this.getData();
	}
	componentDidMount(){
		this.getData();
	}
 // 获取数据
  getData(){
	Utils.get(Utils.domain+'app/logmoneys/usermoneys?tokenId='+global.tokenId,
		moneyData=>{
			this.setState({
				userMoney:moneyData.data.userMoney,
			})
	},err=>{
		console.log('err',err);
	});
  }
	renderHeader(){
		return(<Header 
				style={{backgroundColor:'#F61628'}}
	  			leftStyle={{borderColor:'#fff'}}
	  			titleTextStyle={{color:'#fff'}}
				initObj={{backName:'',title:'余额'}} 
				showRight={true}
				rightStyle={{position:'absolute',right:5}}
				rightText={'余额明细'}
				onPress={()=>this.props.navigator.push({component:MoneyRecord})}
				rightTextStyle={[styles.c14_fff]}
				navigator={this.props.navigator} />);
	}
	render(){
		return(
			<View style={styles.container}>
				{this.renderHeader()}
				<View style={[styles.main]}>
					<View style={[styles.infobox,styles.center]}>
						<Text style={styles.c19}>账户余额</Text>
						<Text style={styles.c50}>
							<Text style={styles.c30}>￥</Text>
							{this.state.userMoney}
						</Text>
					</View>
					<View style={[styles.btnbox,styles.center]}>
						<TouchableOpacity 
							style={[styles.btn,styles.center]}
							onPress={()=>this.props.navigator.push({component:CashConfigsList})}>
							<Text style={[styles.c14_fff,{fontSize: 16}]}>提现</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container:{
		backgroundColor: '#eee',
	},
	flex_1:{flex:1},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	main:{
		backgroundColor: '#eee',
		height:'100%',
	},
	infobox:{
		height:height*0.45,
	},
	c13_666:{
		fontSize: 13,
		color:'#666',
	},
	c14_fff:{
		fontSize: 14,
		color:'#fff',
	},
	c19:{
		fontSize: 19,
		color:'#050101',
	},
	c30:{fontSize: 30},
	c50:{
		marginTop: 20,
		fontSize: 50,
		color:'#050101',
	},
	fb:{fontWeight:'bold'},
	btn:{
		width:'80%',
		paddingVertical:15,
		backgroundColor:'#E60012',
		borderRadius:5,
	},
	btnbox:{
		width:'100%',
	},
});