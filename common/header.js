/**
* 头部
*/
import React,{Component} from 'react';
import {
	StyleSheet,
	View,
	Text,
	ListView,
	ScrollView,
	Image,
	TouchableOpacity,
} from 'react-native';


// 导入回退按钮
import Icon from './left_icon';

export default class Header extends Component{
	constructor(props){
		super(props);
		this._pop = this._pop.bind(this);
	}
	render(){
		var obj = this.props.initObj;
		return(
			<View style={[styles.header, styles.row, styles.center,this.props.style]}>
				<TouchableOpacity style={[styles.row, styles.center]} onPress={this._pop}>
					<Icon style={this.props.leftStyle} />
					<Text style={styles.font}>{obj.backName}</Text>
				</TouchableOpacity>
				<View style={[styles.title, styles.center]}>
					<Text style={[styles.font, styles.titlePos,this.props.titleTextStyle]}
						numberOfLines={1}>{obj.title}</Text>
				</View>
				{
					this.props.showRight?
					<TouchableOpacity style={[styles.right,this.props.rightStyle]} onPress={this.props.onPress}>
						<Text style={[styles.font,this.props.rightTextStyle]}>{this.props.rightText}</Text>
					</TouchableOpacity>
					:null
				}
				{
					this.props.showRightIcon?
					<TouchableOpacity style={styles.right} onPress={this.props.onPress}>
						{this.props.rightIcon}
					</TouchableOpacity>
					:null
				}
			</View>
		);
	}
	_pop(){
		// 是否有传入返回事件
		this.props.backEvent?this.props.backEvent():this.props.navigator.pop();
	}
}
const styles = StyleSheet.create({
	row:{
		flexDirection:'row'
	},
	header:{
		height:42,
		backgroundColor:'#F61628',
		borderBottomWidth:1,
		borderBottomColor:'#F61628',
		paddingVertical:5
	},
	font:{
		color:'#fff',
		fontSize:15,
		fontWeight:'bold'
	},
	title:{
		flex:1,
	},
	titlePos:{
		marginLeft:-20,
		width:200,
		textAlign:'center',
	},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	right:{
		position:'absolute',
		right:5
	}

});