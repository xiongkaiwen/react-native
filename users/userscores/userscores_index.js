/**
* 我的积分
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
let {width,height} = Utils;
//使用规则
import ScoresRule from './userscores_rule';
// 积分使用明细
import UserScores from './userscores';
export default class UserscoresIndex extends Component{
	constructor(props){
		super(props);
		this.state = {
			userScore:0,// 用户积分
		}
	}
	componentDidMount(){
		this.getData();
	}
 // 获取数据
  getData(){
	Utils.get(Utils.domain+'app/userscores/index?tokenId='+global.tokenId,
		scoresData=>{
			this.setState({
				userScore:scoresData.data.userScore,
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
				initObj={{backName:'',title:'积分'}} 
				showRight={true}
				rightStyle={{position:'absolute',right:5}}
				rightText={'积分明细'}
				onPress={()=>this.props.navigator.push({component:UserScores})}
				rightTextStyle={[styles.c14_fff]}
				navigator={this.props.navigator} />);
	}
	render(){
		return(
			<View style={styles.container}>
				{this.renderHeader()}
				<View style={[styles.main]}>
					<View style={[styles.infobox,styles.center]}>
						<Text style={styles.c19}>我的积分</Text>
						<Text style={styles.c50}>{this.state.userScore}</Text>
					</View>
					<View style={[styles.btnbox,styles.center]}>
						<TouchableOpacity 
							style={[styles.btn,styles.center]}
							onPress={()=>alert('敬请期待')}>
							<Text style={[styles.c14_fff,{fontSize: 16}]}>兑换</Text>
						</TouchableOpacity>
					</View>
					<View style={[styles.center,styles.score_rule]}>
						<Text 
							onPress={()=>this.props.navigator.push({component:ScoresRule})}
							style={styles.c13_666}>积分使用规则</Text>
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
	score_rule:{
		marginTop:35,
	}
});