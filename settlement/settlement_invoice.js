/**
* 发票信息
*/
import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
// 图标组件
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon1 from 'react-native-vector-icons/FontAwesome';
// 工具类
import Utils from './../common/utils';
let {width,height} = Utils;
// 按钮组件
import Button from './../common/button';
let checked = 'circle-o',unchecked = 'check-circle-o';

export default class InvoiceModal extends Component{
	constructor(props){
		super(props);
		// 配送方式、发票信息是固定的、构造数据
		this.invoice = {
			'0':[
			{name:'不开发票',code:'no',isInvoice:0},
			{name:'明细',code:'yes',isInvoice:1}
			]
		}
		this.items = [];
		// 用于构造数组
		this.arr = [];
		// 记录选择的值
		this.value = '';
		this.state = {};
		this.state.isShow = false;
		//this.state.isShow = true;
		// 发票抬头
		this.state.isInvoice = false;
		this.state.invoiceClient = '';

		// # 纳税人识别码
		this.state.invoiceCode = '';
		// # 发票信息Id
		this.state.invoiceId = 0;

		// # 发票类型
		this.state.inv_type = 0;
		this.state.clientFocus = false;


		// 发票信息
		for(let i in this.invoice){
			let parent = this.invoice[i];
			for(let j in parent){
				let child = parent[j];
				this.arr.push({
					code:child.code,
					name:child.name,
					isInvoice:child.isInvoice
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
	componentWillReceiveProps(){
		this.getInvoceList();
	}
	componentDidMount(){
		this.getInvoceList();
	}
	getInvoceList(){
		Utils.post(Utils.domain+'app/invoices/pagequery',{tokenId:global.tokenId},(data)=>{
			if(data.data!=undefined)this._invList = data.data;
		},(err)=>{
			alert('出错了,请稍后重试');
			console.log('选择发票信息时出错',err);
		})
	}


	// 选择
	chose(val){
		// 是否显示发票抬头
		(val=='yes')?this.setState({isInvoice:true}):this.setState({isInvoice:false});

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
		if(this.state.isInvoice && this.state.inv_type==1 && this.state.invoiceClient==''){
			alert('请填写发票抬头');
			return;
		}

		let name,code,postData={};
		// 取出选中的payCode以及payName
		/*for(let i in this.arr){
			let item = this.arr[i];
			if(item.code == this.value){
				name = item.name;
				postData.isInvoice = item.isInvoice;
				postData.invoiceClient = this.state.invoiceClient;
			}
		}*/
		postData.isInvoice = this.state.isInvoice;// 是否开发票
		postData.invoiceClient = this.state.invoiceClient;// 发票抬头
		postData.inv_type = this.state.inv_type;// 个人 or 单位
		postData.invoiceCode = this.state.invoiceCode;// 纳税人识别号

		if(postData.inv_type==0)postData.invoiceClient='个人';

		name = '不开发票';
		if(postData.isInvoice==1){
			name = '普通发票（纸质）\r\n'+postData.invoiceClient+'\r\n明细'
		}
		postData.invoiceId = this.state.invoiceId;// 发票id


		// 判断当前是否操作发票信息
		if(postData.inv_type==1){
			let params={};
			params.tokenId = global.tokenId;
			params.invoiceCode = postData.invoiceCode;
			params.invoiceHead = postData.invoiceClient;
			params.id = postData.invoiceId;
			let url = Utils.domain+'app/invoices/edit';
			// 判断修改还是新增
			if(postData.invoiceId==0){
				url = Utils.domain+'app/invoices/add';
			}
			// 执行发票新增
			Utils.post(url,params,(responData)=>{
				if(responData.status==1){
					if(postData.invoiceId==0)postData.invoiceId=responData.data.id;// 新增的发票id
					this.props.commit(this.props.type, name, postData);
					this.setState({isShow:false});
				}else{
					alert(responData.msg);
					return;
				}
			},(err)=>{
				console.log('新增发票信息时出错',err);
				alert('出错了，请稍后重试');
			})
		}else{
			// 将选择的值返回
			this.props.commit(this.props.type, name, postData);
			this.setState({
				isShow:false,
			});
		}

	}
	renderItem(){
		let code = [];
		for(let i in this.items){
			let index = this.items[i];
			code.push(
				<TouchableOpacity activeOpacity={1} onPress={()=>this.chose(index)} key={i} style={styles.item}>
					{
						this.state.items[index]
						?
						<Icon1 name={unchecked} size={20} color={'red'} />
						:
						<Icon1 name={checked} size={20} color={'rgba(0, 0, 0, 0.3)'}/>

					}
					<Text style={styles.ml5}>{this.arr[i].name}</Text>
				</TouchableOpacity>
			);
		}
		return code;
	}
	renderInvList(){
		if(!this._invList)return;
		let code=[];
		for(let i in this._invList){
			let obj = this._invList[i];
			code.push(
					<TextInput  
						underlineColorAndroid={'transparent'}
						caretHidden={true}
						key={obj.id}
						value={obj.invoiceHead}
						onFocus={()=>this.setInvoiceInfo(obj)}
						style={styles.inv_list_item} />
			);
		}
		return code;
	}
	setInvoiceInfo(invInfo){
		this.setState({
			invoiceClient:invInfo.invoiceHead,
			invoiceCode:invInfo.invoiceCode,
			invoiceId:invInfo.id,
		})
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
	            		<Text style={[styles.title,{flex:1}]}>发票信息</Text>
	            		<Icon name={'cancel'} size={25} onPress={()=>this.setState({isShow:false})} />
	            	</View>
	            	<ScrollView style={styles.content}>
	            		<View style={[styles.inv_typebox]}>
	            			<Text style={[styles.inv_tit,styles.c333]}>发票抬头</Text>

	            			<View style={styles.row}>
		            			<TouchableOpacity activeOpacity={1} style={[styles.row,styles.inv_type_item]} onPress={()=>this.setState({inv_type:0})}>
			            			{
										this.state.inv_type==0
										?
										<Icon1 name={unchecked} size={20} color={'red'} />
										:
										<Icon1 name={checked} size={20} color={'rgba(0, 0, 0, 0.3)'}/>

									}
		            				<Text style={styles.ml5}>个人</Text>
		            			</TouchableOpacity>
		            			<TouchableOpacity activeOpacity={1} style={[styles.row,styles.inv_type_item]} onPress={()=>this.setState({inv_type:1})}>
			            			{
										this.state.inv_type==1
										?
										<Icon1 name={unchecked} size={20} color={'red'} />
										:
										<Icon1 name={checked} size={20} color={'rgba(0, 0, 0, 0.3)'}/>

									}
		            				<Text style={styles.ml5}>单位</Text>
		            			</TouchableOpacity>
							</View>
	            		</View>

						{
							this.state.inv_type==1
							?
							<View>
								<TextInput 
									value={this.state.invoiceClient}
									onFocus={()=>this.setState({clientFocus:true})}
									onBlur={()=>setTimeout(()=>this.setState({clientFocus:false}),100)}
									placeholder={'请填写单位名称'}
									autoCapitalize={'none'}
              						autoCorrect={false}
									onChangeText={(val)=>this.setState({invoiceClient:val,invoiceId:0})}
									underlineColorAndroid="transparent"
									style={styles.invoiceClient} />

									{
										this.state.clientFocus
										?
										<KeyboardAvoidingView
										 behavior="padding"
										 style={styles.invoiceClientList}>
											{this.renderInvList()}
										</KeyboardAvoidingView>
										:
										null
									}
								<TextInput 
									value={this.state.invoiceCode}
									placeholder={'请填写纳税人识别码'}
									placeholderTextColor={'red'}
									onChangeText={(val)=>{this.setState({invoiceCode:val})}}
									underlineColorAndroid="transparent"
									style={[styles.invoiceClient,styles.mt10]} />	
								
							</View>
							:
							null
						}

	            		
	            		<View style={styles.itembox}>
	            			<Text style={[styles.item_tit,styles.c333]}>发票内容</Text>
							{this.renderItem()}
						</View>



					
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
		justifyContent:'flex-end',
	},
	row:{
		flexDirection:'row',
	},
	title:{
		textAlign:'center',
		fontSize:18,
		fontWeight:'bold'
	},
	main:{
		height:'100%',
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
	},
	// 个人 or 单位
	inv_typebox:{
		backgroundColor:'#fff',
		paddingVertical:10,
	},
	inv_type_item:{
		marginRight:10,
	},
	inv_tit:{
		marginBottom:5,
	},
	ml5:{
		marginLeft:5,
	},
	c333:{color:'#333'},
	itembox:{
		backgroundColor:'#fff',
		paddingVertical:10,
	},
	item_tit:{
		paddingVertical:10,
		borderBottomWidth:1,
		borderBottomColor:'#ccc',
	},
	item:{
		paddingTop:5,
		paddingBottom:5,
		flexDirection:'row',
		alignItems:'center',
	},
	invoiceClient:{
		paddingTop:5,
		height:35,
	},
	invoiceClientBox:{
		position:'relative',
	},
	invoiceClientList:{
		position:'absolute',
		top:35,
		width:'100%',
		backgroundColor:'#f5f5f5',
		zIndex:999,
		paddingLeft:10,
	},
	inv_list_item:{
		borderBottomWidth:1,
		borderBottomColor:'#ccc',
		height:35,
		paddingTop:5,
	},

	mt10:{marginTop:10},
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