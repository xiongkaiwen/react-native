/**
* 订单投诉类型
*/
import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
// modal组件
import Modal from 'react-native-root-modal';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
// 工具类
import Utils from './../../common/utils';
var {width,height} = Utils;
// 按钮组件
import Button from './../../common/button';
var checked = 'circle-o',unchecked = 'check-circle-o';




export default class ComplaintType extends Component{
	constructor(props){
		super(props);

		// 配送方式、发票信息是固定的、构造数据
		// 订单投诉理由选项
		this._complainType = {'1':'承诺的没有做到','2':'未按约定时间发货','3':'未按成交价格进行交易','4':'恶意骚扰'}


		this.deliver = {
			'0':[
			{name:'承诺的没有做到',code:'type_1',val:1},
			{name:'未按约定时间发货',code:'type_2',val:2},
			{name:'未按成交价格进行交易',code:'type_3',val:3},
			{name:'恶意骚扰',code:'type_4',val:4}
			]
		};
		this.items = [];
		// 用于构造数组
		this.arr = [];
		// 记录选择的值
		this.value = '';



		//console.log(props);
		this.state = {};
		this.state.isShow = false;
		// 配送方式
		for(let i in this.deliver){
			let parent = this.deliver[i];
			for(let j in parent){
				let child = parent[j];
				this.arr.push({
					code:child.code,
					name:child.name,
					val:child.val
				});
				// 保存
				this.items.push(child.code);
			}
		}



		// 设置选项的选择状态、默认第一个选中
		let obj = {};
		for(let i in this.items){
			let index = this.items[i];
		}
		this.state.items = obj;

		// 绑定this
		this.chose = this.chose.bind(this);
		this.doneChose = this.doneChose.bind(this);

	}
	// 选择
	chose(val){	
		let obj = {};
		// 设置选项的选择状态
		for(let i in this.items){
			let index = this.items[i];
			obj[index]=(val==index)?true:false;
		}
		this.value = val;
		this.setState({
			items:obj
		});
	}
	// 完成选择
	doneChose(){
		let name,code,val;
		// 取出选中的payCode以及payName
		for(let i in this.arr){
			let item = this.arr[i];
			if(item.code == this.value){
				name = item.name;// 用于显示
				val = item.val;
			}
		}
		if(this.value==''){
			Utils.msg('请选择投诉类型','center');
			return;
		}
		// 将选择的值返回
		this.props.commit(name, val);
		this.setState({
			isShow:false,
		});
	}


	componentDidMount(){
		//console.log('组件挂载完毕');
	}

	renderItem(){
		let code = [];
		for(let i in this.items){
			let index = this.items[i];
			code.push(
				<TouchableOpacity activeOpacity={1} key={i} style={styles.item} onPress={()=>this.chose(index)}>
					<Text>{this.arr[i].name}</Text>
					{
						this.state.items[index]
						?
						<Icon1 name={unchecked} size={20} color={'red'} />
						:
						<Icon1 name={checked} size={20} color={'rgba(0, 0, 0, 0.3)'} />

					}
				</TouchableOpacity>
			);
		}
		return code;
	}

	render(){
		return(
			<Modal 
				style={styles.contrainer}
                visible={this.state.isShow}>
            	<View style={styles.main}>
	            	{/*头部*/}
	            	<View style={styles.header}>
	            		<Text style={[styles.title,{flex:1}]}>投诉类型</Text>
	            		<Icon name={'cancel'} size={25} onPress={()=>this.doneChose()} />
	            	</View>
	            	<ScrollView style={styles.content}>
						{this.renderItem()}
					</ScrollView>
					<Button 
			 		onPress={()=>this.doneChose()} 
			 		style={[styles.btn,styles.center]} 
			 		textStyle={[styles.btn_text]} text={'确定'}/>
				</View>
            </Modal>
		);
	}
}
const styles = StyleSheet.create({
	center:{justifyContent:'center',alignItems:'center'},
	contrainer:{
		height:height-20,
		backgroundColor:'rgba(0,0,0,0.5)',
		justifyContent:'flex-end',
	},
	title:{
		textAlign:'center',
		fontSize:18,
		fontWeight:'bold'
	},
	main:{
		backgroundColor:'#f6f6f8',
	},
	header:{
		padding:5,
		flexDirection:'row',
		height:40,
		backgroundColor:'#fff',
		borderBottomWidth:1,
		borderBottomColor:'red'
	},
	content:{
		paddingLeft:10,
		paddingRight:10,
		marginTop:5,
		height:height*0.23,
	},
	item:{
		paddingTop:5,
		paddingBottom:5,
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center',
		borderBottomWidth:1,
		borderBottomColor:'#ccc'
	},
	btn:{
		marginLeft:10,
		marginRight:10,
		marginTop:5,
		width:width-20,
		padding:10,
		backgroundColor:'red',
		borderRadius:3,
		marginBottom:5,
	},
	btn_text:{
		fontSize:15,
		color:'#fff'
	}
});