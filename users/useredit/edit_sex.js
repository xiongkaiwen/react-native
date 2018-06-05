import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';

//工具类
import Utils from './../../common/utils';
let {width,height} = Utils;
import Header from './../../common/header';

// 按钮组件
import Button from './../../common/button';
// 图标组件
import Icon from 'react-native-vector-icons/FontAwesome';
//
import Edit from './edit';

export default class EditSex extends Component{
	constructor(props){
		super(props);
		this.state={
			sex:this.props.sex,
		}
		// 绑定this
		this.editSex = this.editSex.bind(this);
	}
	// 点击确定
	editSex(val){
		let that = this;
		// 验证通过,请求接口,完成修改
		let url = Utils.domain+'app/users/edit';
		let postData={
			tokenId:global.tokenId,
			userSex:val,
		}
		Utils.post(
				   url,
				   postData,
				   function(responData){
				   		Utils.msg(responData.msg);
				   		if(responData.status==1){
				   			that.setState({sex:val});
				   			// 刷新上一页路由,
				   			that.props.navigator.replacePrevious({
				   				component:Edit,
				   			});
				   			that.props.navigator.pop();
				   		}
				   },
				   function(err){
				   		console.log(err);
				   });
	}

	render(){
		return(
			<View style={styles.contrainer}>
				{/* 头部 */}
				<Header initObj={{backName:' ',title:'修改性别'}} 
					backEvent={()=>this.props.navigator.pop()}/>
				<View style={styles.main}>

					<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.editSex(1)}>
						<Text style={styles.text}>男</Text>
						<Text style={[styles.text]}>
							{
								(this.state.sex==1)
								?
								<Icon name={'check-circle-o'} size={23} color={'red'} />
								:
								<Icon name={'check-circle-o'} size={23}  />
							}
							
						</Text>
					</TouchableOpacity>

					<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.editSex(2)}>
						<Text style={styles.text}>女</Text>
						<Text style={[styles.text]}>
							{
								(this.state.sex==2)
								?
								<Icon name={'check-circle-o'} size={23} color={'red'} />
								:
								<Icon name={'check-circle-o'} size={23}  />
							}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity style={[styles.row,styles.item]} onPress={()=>this.editSex(0)}>
						<Text style={styles.text}>保密</Text>
						<Text style={[styles.text]}>
							{
								(this.state.sex==0)
								?
								<Icon name={'check-circle-o'} size={23} color={'red'} />
								:
								<Icon name={'check-circle-o'} size={23}  />
							}
						</Text>
					</TouchableOpacity>

				</View>

			</View>
		);
	}
}


const styles = StyleSheet.create({
	contrainer:{
		backgroundColor:'#f6f6f8',
	},
	flex_1:{flex:1},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	row:{flexDirection:'row'},
	main:{
		padding:10,
		backgroundColor:'#fff'
	},
	item:{
		justifyContent:'space-between',
		alignItems:'center',
		backgroundColor:'#fff',
		borderBottomWidth:1,
		borderBottomColor:'#ededed',
		padding:10,
		paddingRight:0,
	},
});