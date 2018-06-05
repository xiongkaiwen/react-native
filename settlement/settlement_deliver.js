/**
* 配送方式
*/
import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
// 工具类
import Utils from './../common/utils';
let {width,height} = Utils;
// 按钮组件
import Button from './../common/button';
export default class DeliverModal extends Component{
	constructor(props){
		super(props);
		// 配送方式、发票信息是固定的、构造数据
		this.deliver = {
			'0':[
			{name:'快递运输',code:'express',deliverType:0},
			{name:'自提',code:'self',deliverType:1}
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
					deliverType:child.deliverType
				});
				// 保存
				this.items.push(child.code);
			}
		}



		// 设置选项的选择状态、默认第一个选中
		let obj = {};
		for(let i in this.items){
			let index = this.items[i];
			obj[index] = (i==0)?true:false;
		}
		this.value = this.items[0];// 默认选中
		this.state.items = obj;

		// 绑定this
		this.chose = this.chose.bind(this);
		this.doneChose = this.doneChose.bind(this);

	}
	// 选择
	chose(val){
		
		// 每次更改收货方式都请求一次计算运费接口,将数据传回结算页面显示
		/*isUseScore:0
		useScore:0
		
		areaId2:361000
		deliverType:0*/


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
		let name,code,postData={};
		// 取出选中的payCode以及payName
		for(let i in this.arr){
			let item = this.arr[i];
			if(item.code == this.value){
				name = item.name;// 用于显示
				postData.deliverType = item.deliverType;
			}
		}
		// 将选择的值返回
		this.props.commit(this.props.type, name, postData);
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
				<TouchableOpacity activeOpacity={1} onPress={()=>this.chose(index)} key={i} style={styles.item}>
					<Text>{this.arr[i].name}</Text>
					{
						this.state.items[index]
						?
						<Icon1 name={'check-circle-o'} size={20} color={'red'}/>
						:
						<Icon1 name={'circle-o'} size={20} color={'rgba(0, 0, 0, 0.3)'}/>

					}
				</TouchableOpacity>
			);
		}
		return code;
	}

	render(){
		return(
			<Modal 
                animationType={'fade'} 
                onRequestClose={() => {console.log("Modal has been closed.")}}
                visible={this.state.isShow}
                transparent={true}
                onShow={this.showDone}
                >
            <View style={styles.contrainer}>
            	<View style={styles.main}>
	            	{/*头部*/}
	            	<View style={styles.header}>
	            		<Text style={[styles.title,{flex:1}]}>配送方式</Text>
	            		<Icon name={'cancel'} size={25} onPress={()=>this.setState({isShow:false})} />
	            	</View>
	            	<ScrollView style={styles.content}>
						{this.renderItem()}
					</ScrollView>
					<Button 
			 		onPress={()=>this.doneChose()} 
			 		style={[styles.btn,styles.center]} 
			 		textStyle={[styles.btn_text]} text={'确定'}/>
				</View>
            </View>
            </Modal>
		);
	}
}
const styles = StyleSheet.create({
	center:{justifyContent:'center',alignItems:'center'},
	contrainer:{
		flex:1,
		backgroundColor:'rgba(0,0,0,0.2)',
		paddingTop:height*0.05,
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
		minHeight:height*0.18,
		maxHeight:height*0.2,
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
		marginBottom:10,
	},
	btn_text:{
		fontSize:15,
		color:'#fff'
	}
});