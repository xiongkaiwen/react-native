/**
* 发布商品咨询
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Picker,
  NetInfo,
  TextInput
} from 'react-native';
//引入公共头部
import Header from './../common/header';
import Button from './../common/button';
//工具类
import Utils from './../common/utils';
let {width,height} = Utils;
import ModalPicker from 'react-native-modal-picker';

export default class Consult extends Component {
	constructor(props){
		super(props);
		this.state={
			consultType:0,
			consultContent:'',
			textInputValue: '',
		};
		// 商品咨询类别
		this._consultType;
		// 是否有网络
		this.state.isConnected = true;
		// 是否加载中
		this.state.loading = false;
		this.getData = this.getData.bind(this);
	}
	 // 获取数据
	  getData(){
	  	let that = this;
		let url = Utils.domain+'app/goodsconsult/getConsultType';
		let postData = {};
	    Utils.get(
	    			url,
	    			(responData)=>{
	    				that._consultType = responData.data;
	    				if(global._platfrom=='ios'){
	    					that._consultType = [];
	    					for(let i in responData.data){
	    						let item = responData.data[i];
	    						this._consultType.push({
					                key:item.dataVal,
					                label:item.dataName
					            });
	    					}
	    				}
	    				that.setState({loading:false});
	    			},
	    			function(err){
			    	  console.log('商品咨询出错',err);
				      // 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
						});
					}

	    });
	  }
	  // 组件挂载完毕
	  componentDidMount(){
	    // 检测网络状态
		NetInfo.isConnected.fetch().done((isConnected) => {
		  if(isConnected || global._platfrom=='ios'){
			// 调用方法请求数据
			this.getData();
		  }else{
			// 当前无网络连接
			this.setState({
			  isConnected:false,
			});
		  }
		});
	  }
  // 渲染头部
  renderHeader(){
	  return(<Header 
	  		initObj={{backName:'',title:'发表咨询'}}
	  		navigator={this.props.navigator} />);
  }
  // 渲染咨询类型
  renderTypeData(){
	let code = [];
	code.push(<Picker.Item key={'001'} label="请选择" value="0" />)
	for(let i in this._consultType){
		let reason = this._consultType[i];
		code.push(
			<Picker.Item key={i} label={reason.dataName} value={reason.dataVal} />
		);
	}
	return code;
  }
  // ios下选择咨询类型
  doneChose(option){
  	this.setState({
  		consultType:option.key,
  		textInputValue:option.label,
  	})
  }
  // 提交咨询
  consultCommit(){
  	let {consultType,consultContent} = this.state;
  	if(consultType<=0){
  		Utils.msg('请选择咨询类型');
  		return;
  	}
  	if(consultContent.length==0){
  		Utils.msg('请输入商品咨询');
  		return;
  	}
  	let url = Utils.domain+'app/goodsconsult/add';
  	let postData = {
  		tokenId:global.tokenId,
  		consultType:consultType,
  		consultContent:consultContent,
  		goodsId:this.props.goodsId,
  	}
  	Utils.post(
  			url,
  			postData,
  			(responData)=>{
  				if(responData.status==1){
  					// 成功提交,返回上一页,刷新
  					this.props.refresh();
  					this.props.navigator.pop();
  				}
  				Utils.msg(responData.msg);
  			},
  			(err)=>{
  				console.log('提交咨询时出错',err);
  			});
  }
  render() {
	// 请求数据中
	if(this.state.loading){
		return Utils.loading();
	}
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
	    	<View style={[styles.item,styles.row]}>
	    		<Text style={styles.c13_333}>咨询类型：</Text>
	    		<View style={styles.flex_1}>
	    			{
	    				global._platfrom=='ios'
	    				?
	    				<ModalPicker
		                    cancelText={'关闭'}
		                    data={this._consultType}
		                    onChange={(option)=>{this.doneChose(option)}}>
		                    <TextInput
		                        style={[styles.c13_333,{height:30}]}
		                        editable={false}
		                        placeholderTextColor={'#999'}
		                        placeholder="请选择咨询类型"
		                        value={this.state.textInputValue} />
		                </ModalPicker>
		                :
			    		<Picker
						  style={styles.picker}
						  selectedValue={this.state.consultType}
						  onValueChange={(val) => this.setState({consultType: val})}>
						  {this.renderTypeData()}
						</Picker>
					}
				</View>
	    	</View>
	    	<View style={[styles.item,styles.row]}>
	    		<Text style={styles.c13_333}>咨询内容：</Text>
	    	</View>
	    	<View style={[styles.item,styles.center]}>
	    		<TextInput 
	    			style={styles.textInput}
	    			multiline={true}
	    			underlineColorAndroid={"transparent"}
	    			onChangeText={(text) => this.setState({consultContent:text})} />
	    	</View>
	    	<View style={styles.flex_1,styles.center}>
	    		<Button 
	    		onPress={()=>this.consultCommit()}
	    		style={styles.btn}
	    		text={'提交'}/>
	    	</View>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f6',
   },
	flex_1:{
		flex:1,
	},
	row:{
		flexDirection:'row'
	},
	center:{
		justifyContent:'center',
		alignItems:'center'
	},
	c13_666:{
		fontSize:13,
		color:"#666"
	},
	c13_333:{
		fontSize:13,
		color:"#333"
	},
	c12_666:{
		fontSize:12,
		color:"#666"
	},
	item:{
		paddingLeft:10,
		paddingRight:10,
		alignItems:'center',
	},
	picker:{
		height:35,
		width:100
	},
	textInput:{
		marginTop:10,
		padding:0,
		width:'100%',
		height:height*0.2,
		borderWidth:1,
		borderColor:'gold',
		borderRadius:3,
		textAlignVertical: 'top',
	},
	btn:{
		marginTop:10,
		padding:5,
		paddingLeft:30,
		paddingRight:30,
		borderWidth:1,
		borderColor:'#eee',
		borderRadius:3,
		backgroundColor:'#fff',
	}

});