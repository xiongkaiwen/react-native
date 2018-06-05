import React, { Component } from 'react';
import {
  Image,
  ScrollView,
  View,
  Text,
  Picker,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  NetInfo,
  Animated
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
// 图标组件
import Icon from 'react-native-vector-icons/FontAwesome';
import Utils from './../../common/utils';
var {width,height} = Utils;
import Header from './../../common/header';
import Button from './../../common/button';
// 地址列表页
import UserAddress from './useraddress_edit';


// ios地址选择
import AreaIos from './area';

var addrData,area1,area2,area3,area4;
export default class UserAddressEdit extends Component{
	constructor(props){
		super(props);
		this.state = {};
		// 是否有网络
		this.state.isConnected = true;
		// 加载中
		this.state.loading = true;

		this.state.area1 = 0;
		this.state.area2 = 0;
		this.state.area3 = 0;
		this.state.area4 = 0;

		// 是否启用选择框
		this.state.enabledArea2 = false;
		this.state.enabledArea3 = false;
		this.state.enabledArea4 = false;

		/****************设置参数  */
		this.state.addressId = this.props.addressId;
		this.state.userName = '';
		this.state.userPhone = '';
		this.state.userAddress = '';
		this.state.isDefault = 0;


		// 绑定this
		this.backEvent = this.backEvent.bind(this);
		this.choseArea1 = this.choseArea1.bind(this);
		this.choseArea2 = this.choseArea2.bind(this);
		this.choseArea3 = this.choseArea3.bind(this);
		this.choseArea4 = this.choseArea4.bind(this);
		this.save = this.save.bind(this);
		this._onRefresh = this._onRefresh.bind(this);

	}
	getData(){
		let that = this;
		let url = Utils.domain+'app/useraddress/getById';
		let postData = {
			tokenId:global.tokenId,
			addressId:that.props.addressId,
		}
		Utils.post(
				   url,
				   postData,
				   (responData)=>{
				   		if(responData.status==1){
				   			// 当前为修改
				   			that._edit = true;
				   			addrData = responData.data;
				   			// 存在该下标,则为修改地址,设置表单值
				   			if(addrData.addressId!==undefined){
				   				let setValue = {};
				   				setValue.userName = addrData.userName;
				   				setValue.userPhone = addrData.userPhone;
				   				setValue.userAddress = addrData.userAddress;
				   				setValue.isDefault = addrData.isDefault;


				   				// 设置地区数据
				   				area1 = addrData.area1;
				   				// 设置地区选中
					   			let areaArr = addrData.areaIdPath.split('_');
				   				if(global._platfrom=='ios'){
				   					that.defaultArea1 = parseInt(areaArr[0],10);
				   					that.defaultArea2 = parseInt(areaArr[1],10);
					   				that.defaultArea3 = parseInt(areaArr[2],10);
					   				that.defaultArea4 = parseInt(areaArr[3],10);
				   				}else{
					   				setValue.area1 = parseInt(areaArr[0],10);
					   				setValue.area2 = parseInt(areaArr[1],10);
					   				setValue.area3 = parseInt(areaArr[2],10);
					   				setValue.area4 = parseInt(areaArr[3],10);
				   				}
					   				


				   				that.setState(setValue);

				   				// 选中地址
				   				(global._platfrom=='ios')?null:that.choseArea1(setValue.area1, true);
				   			}else{
				   			 	// 新增地址,设置省的可选值
				   			 	area1 = addrData;
				   			}

				   			that.setState({loading:false});
				   			
				   		}else{
				   			Utils.msg(responData.msg,'top');
				   			that.props.navigator.pop();
				   		}
				   },
				   (err)=>{
				   		console.log('用户地址错误',err);
				   		// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}
				   });
	}
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
	_onRefresh(){
	// 检测网络状态
	NetInfo.isConnected.fetch().done((isConnected) => {
		if(isConnected || global._platfrom=='ios'){
		  this.setState({
			isConnected:true,
			loading:false
		  });
		  this.getData();
		}else{
		  // 当前无网络连接
		  this.setState({
			isConnected:false,
		  });
		}
	});
  }
	// 渲染省
	renderArea(area){
		let code = [];
		code.push(<Picker.Item key={0} label="请选择" value="0" />);
		for(let i in area){
			let data = area[i];
			code.push(<Picker.Item key={data.areaId} label={data.areaName} value={data.areaId} />);
		}
		return code;
	}
	// 选择省
	choseArea1(areaId, isEdit){
		let that = this;
		if(areaId==0){
			// 禁用area2、area3并且设置值为0,即请选择状态
			that.setState({
				area1:areaId,
				area2:0,
				area3:0,
				area4:0,
				enabledArea2:false,
				enabledArea3:false,
				enabledArea4:false,
			});
			return;
		}
		that.setState({
			area1:areaId,
			enabledArea2:false,
			enabledArea3:false,
			enabledArea4:false,
		});
		
			
		// 请求市级数据,启用市级picker
		let url = Utils.domain+'app/Areas/listQuery';
		let postData = {
			tokenId:global.tokenId,
			parentId:areaId
		};
		Utils.post(
				   url,
				   postData,
				   (responData)=>{
				   		if(responData.status==1){
				   			area2 = responData.data;
				   			that.setState({enabledArea2:true,renderdArea2:true});
				   		}
				   },
				   (err)=>{
				   		console.log(err);
				   });
		// 如果为修改则调用
		if(isEdit)that.choseArea2(that.state.area2,isEdit);
	}
	// 选择市级
	choseArea2(areaId,isEdit){
		let that = this;

		if(areaId==0){
			// 禁用area3并且设置值为0,即请选择状态
			that.setState({
				area2:areaId,
				area3:0,
				area4:0,
				enabledArea3:false,
				enabledArea4:false,
			});
			return;
		}
		that.setState({
			area2:areaId,
			enabledArea3:false,
			enabledArea4:false,
		});
		// 请求市级数据,启用市级picker
		let url = Utils.domain+'app/Areas/listQuery';
		let postData = {
			tokenId:global.tokenId,
			parentId:areaId
		};
		Utils.post(
				   url,
				   postData,
				   (responData)=>{
				   		if(responData.status==1){
				   			area3 = responData.data;
				   			that.setState({enabledArea3:true,renderdArea3:true});
				   		}
				   },
				   (err)=>{
				   		console.log(err);
				   });
		// 如果为修改则调用
		if(isEdit)that.choseArea3(that.state.area3,isEdit);
	}
	// 选择县级
	choseArea3(areaId){
		let that = this;
		if(areaId==0){
			// 禁用area4并且设置值为0,即请选择状态
			that.setState({
				area3:areaId,
				area4:0,
				enabledArea4:false,
			});
			return;
		}
		that.setState({
			area3:areaId,
			enabledArea4:false,
		});
		// 请求市级数据,启用市级picker
		let url = Utils.domain+'app/Areas/listQuery';
		let postData = {
			tokenId:global.tokenId,
			parentId:areaId
		};
		Utils.post(
				   url,
				   postData,
				   (responData)=>{
				   		if(responData.status==1){
				   			area4 = responData.data;
				   			that.setState({enabledArea4:true,renderdArea4:true});
				   		}
				   },
				   (err)=>{
				   		console.log(err);
				   });
	}
	// 选择县级
	choseArea4(val){
		this.setState({area4: val});
		if(this._edit){
			this.defaultArea1 = 0;
			this.defaultArea2 = 0;
			this.defaultArea3 = 0;
			this.defaultArea4 = 0;
		}
	}


	// 返回操作
	backEvent(){
		this.props.navigator.pop();
	}
	// 保存操作
	save(){
		/*
			  addressId => 0    // addressId,不为0则为修改
			  userName => 123123 
			  areaId => 441622 // 最后一级areaId
			  userPhone => 123123
			  userAddress => 123123123
			  isDefault => 0
		*/
		// 表单验证
		let postData = {};
		// 详细地址
		if(this.state.userAddress==''){
			Utils.msg('请填写详细地址');
			return;
		}
		// 收货人
		if(this.state.userName==''){
			Utils.msg('请填写收货人');
			return;
		}
		// 手机号码
		if(this.state.userPhone==''){
			Utils.msg('请填写手机号码');
			return;
		}
		// 手机必须以1开头长度为11位
		if(!(/^1\d{10}$/.test(this.state.userPhone))){ 
	        Utils.msg('请输入正确的手机号码');
	        return false; 
	    }
		postData.areaId=(this.state.area4>0)?this.state.area4:this.state.area3;
		postData.userName=this.state.userName;
		postData.userAddress=this.state.userAddress;
		postData.userPhone=this.state.userPhone;
		// 是否默认地址
		postData.isDefault = (this.state.isDefault)?1:0;
		// addressId
		postData.addressId = this.props.addressId;

		// 请求接口
		let url = Utils.domain+'app/useraddress/edits';
		// tokenId 
		postData.tokenId = global.tokenId;
		let that = this;
		Utils.post(
				   url,
				   postData,
				   (responData)=>{
				   		if(responData.status==1){
				   			Utils.msg(responData.msg,'top');
				   			// 返回上一页 并更新数据
				   			that.props.refresh();
				   			that.props.navigator.pop();
				   		}else{
				   			Utils.msg(responData.msg);
				   		}
				   },
				   (err)=>{
				   		console.log(err);
				   });
	}
	applyFocus=(flag)=>{
		if(global._platfrom=='ios'){
			let y = 100;
			if(Utils.height<667)y=200;
			if(flag==true)this._scrollViewObj._component.scrollTo({x:0,y:y});
		}else{
			this._scrollViewObj._component.scrollToEnd();
		}
		
	}
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		if(this.state.loading){
			return Utils.loading();
		}
		return(
			<View style={styles.contrainer}>
				{/* 头部 */}
				<Header initObj={{backName:' ',title:this.props.title}} 
				backEvent={()=>this.backEvent()}/>
				<Animated.ScrollView 
					ref={c=>this._scrollViewObj=c}
					style={styles.main}>
					<View style={styles.addr_area}>
						{/* 省级联动 */}
						<View style={[styles.row,styles.item]}>
							<Text style={styles.text}>省：</Text>
							<View style={[styles.textinput,styles.flex_1]}>
								{
									global._platfrom=='ios'
									?
									<AreaIos 
									initVal={this.defaultArea1}
									data={area1} 
									selected={this.choseArea1} />
									:
									<Picker
									  style={{height:50}}
									  itemStyle={{fontSize:15,height:50,}}
							          selectedValue={this.state.area1}
							          onValueChange={(val) => this.choseArea1(val)}>
							      	  {/* 渲染省 */}
							          {this.renderArea(area1)}
							        </Picker>
								}
									

							</View>
						</View>
						<View style={[styles.row,styles.item]}>
							<Text style={styles.text}>市：</Text>
							<View style={[styles.textinput,styles.flex_1]}>
								{
									global._platfrom=='ios'
									?
									(
										this.state.enabledArea2
										?
										<AreaIos 
										initVal={this.defaultArea2}
										data={area2} 
										selected={this.choseArea2}/>
										:
										<View style={[styles.flex_1,{justifyContent:'center'}]}>
											<Text style={{fontSize:17,color:'#ccc'}}>请选择</Text>
										</View>
									)
									:
									<Picker
									  enabled={this.state.enabledArea2}
							          selectedValue={this.state.area2}
							          onValueChange={(val) => this.choseArea2(val)}>
							          {
							          	this.state.renderdArea2?
							          	this.renderArea(area2):
							          	<Picker.Item label="请选择" value="0" />
							          }
							        </Picker>
								}
									
							</View>
						</View>
						<View style={[styles.row,styles.item]}>
							<Text style={styles.text}>县：</Text>
							<View style={[styles.textinput,styles.flex_1]}>
								{
									global._platfrom=='ios'
									?
									(
										this.state.enabledArea3
										?
										<AreaIos 
										initVal={this.defaultArea3}
										data={area3} 
										selected={(val) => this.choseArea3(val)}/>
										:
										<View style={[styles.flex_1,{justifyContent:'center'}]}>
											<Text style={{fontSize:17,color:'#ccc'}}>请选择</Text>
										</View>
									)
									:
									<Picker
									  enabled={this.state.enabledArea3}
							          selectedValue={this.state.area3}
							          onValueChange={(val) => this.choseArea3(val)}>
							          {
							          	this.state.renderdArea3?
							          	this.renderArea(area3):
							          	<Picker.Item label="请选择" value="0" />
							          }
							        </Picker>
								}
									

							</View>
						</View>
						<View style={[styles.row,styles.item]}>
							<Text style={styles.text}>乡/镇/街道：</Text>
							<View style={[styles.textinput,styles.flex_1]}>
								{
									global._platfrom=='ios'
									?
									(
										this.state.enabledArea4
										?
										<AreaIos 
										initVal={this.defaultArea4}
										data={area4} 
										selected={(val) => this.choseArea4(val)}/>
										:
										<View style={[styles.flex_1,{justifyContent:'center'}]}>
											<Text style={{fontSize:17,color:'#ccc'}}>请选择</Text>
										</View>
									)
									:
									<Picker
									  enabled={this.state.enabledArea4}
							          selectedValue={this.state.area4}
							          onValueChange={(val) => this.setState({area4: val})}>
							          {
							          	this.state.renderdArea4?
							          	this.renderArea(area4):
							          	<Picker.Item label="请选择" value="0" />
							          }
							        </Picker>
								}
									

							</View>
						</View>
						<View style={[styles.row,styles.item]}>
							<Text style={styles.text}>详细地址：</Text>
							<View style={[styles.textinput,styles.flex_1]}>
								<TextInput 
									style={styles.textinput}
									value={this.state.userAddress}
									placeholder={'请填写详细地址'}
									onChangeText={(val)=>this.setState({userAddress:val})}
									underlineColorAndroid={"transparent"} />
							</View>
						</View>
						<View style={[styles.row,styles.item]}>
							<Text style={styles.text}>收货人：</Text>
							<View style={[styles.textinput,styles.flex_1]}>
								<TextInput 
									onFocus={()=>this.applyFocus(true)}
									style={styles.textinput}
									value={this.state.userName}
									placeholder={'请填写收货人'}
									onChangeText={(val)=>this.setState({userName:val})}
									underlineColorAndroid={"transparent"} />
							</View>
						</View>
						<View style={[styles.row,styles.item]}>
							<Text style={styles.text}>手机号码：</Text>
							<View style={[styles.textinput,styles.flex_1]}>
								<TextInput 
									onFocus={()=>this.applyFocus(true)}
									style={styles.textinput}
									value={this.state.userPhone}
									placeholder={'请填写手机号码'}
									maxLength={11}
									onChangeText={(val)=>this.setState({userPhone:val.replace(/\D/g, "")})}
									underlineColorAndroid={"transparent"} />
							</View>
						</View>
						<View style={[styles.row,styles.item,{paddingTop:10,paddingBottom:10,borderBottomWidth:0}]}>
							<TouchableOpacity style={{marginRight:5,}} onPress={()=>this.setState({isDefault:!this.state.isDefault})}>
							{
								(this.state.isDefault)?
								<Icon name={'dot-circle-o'} size={20} color={'red'}  />:
								<Icon name={'dot-circle-o'} size={20}  />
							}
							</TouchableOpacity>
							<Text style={styles.text}>
								设为默认(每次购买时会默认使用该地址)
							</Text>
						</View>
					</View>
					<Button 
	                    text={'保存'}
	                    textStyle={styles.btn_text}
	                    onPress={()=>this.save()}   
	                    style={[styles.flex_1,styles.btn,styles.center]} />
				</Animated.ScrollView>
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
	text:{
		fontSize:15
	},
	main:{
		height:height-50
	},
	addr_area:{
		backgroundColor:'#fff',
		marginTop:10,
		marginBottom:10,
	},
	item:{
		paddingLeft:10,
		paddingRight:10,
		alignItems:'center',
		borderBottomWidth:1,
		borderBottomColor:'#ccc'
	},
	textinput:{
		height:50
	},
	btn:{
	    backgroundColor:'#e00102',
	    borderRadius:5,
	    borderWidth:1,
	    borderColor:'#e00102',
	    padding:8,
	    marginBottom:10,
	    marginLeft:5,
	    marginRight:5,
 	},
	btn_text:{
	    textAlign:'center',
	    color:'#fff',
	    fontSize:16
	}
});