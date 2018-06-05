import React, { Component } from 'react';
import {
  Image,
  ScrollView,
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
// 图标组件
import Icon from 'react-native-vector-icons/FontAwesome';
import Utils from './../../common/utils';
var {width,height} = Utils;

import Header from './../../common/header';

// 结算页面
import Settlement from './../../settlement/settlement';

// 编辑收货地址
import Edit from './useraddress_edit';

var addrData;


export default class UserAddress extends Component{
	constructor(props){
		super(props);


		this.state = {};
		// 是否有网络
		this.state.isConnected = true;
		this.state.loading = true;
		this.state.hasData = false;

		// 绑定this
		this.getData = this.getData.bind(this);
		this.addAddr = this.addAddr.bind(this);
		this.editAddr = this.editAddr.bind(this);
		this.delAddr = this.delAddr.bind(this);
		this.doDelAddr = this.doDelAddr.bind(this);
		this.setDefault = this.setDefault.bind(this);
		this.refresh = this.refresh.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
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

	// 刷新数据
	refresh(){
		this.getData();
	}
	// 返回结算页面
	returnSettlement(addressId){
		// 返回结算页面
		// 替换结算页面,更新收货地址,并传递addressId、type、
		this.props.navigator.replacePrevious({
			component:Settlement,
			passProps:{
				addressId:addressId,
				type:this.props.type,
				backEvent:this.props.navigator.pop
			}
		});
		// 弹出当前页
		this.props.navigator.pop();
	}

	// 获取数据
	getData(){
		let that = this;
		let url = Utils.domain+'app/useraddress/index';
		let postData = {
			tokenId:global.tokenId,
		};
		Utils.post(
				   url,
				   postData,
				   function(responData){
				   		if(responData.status==1 && responData.data.list.length>0){
				   			addrData = responData.data.list;

				   			that.setState({
				   				loading:false,
				   				hasData:true,
				   			});
				   		}else{
				   			that.setState({
				   				loading:false,
				   				hasData:false,
				   			});
				   		}
				   },
				   function(err){
				   		// 网络请求超时或断网时 [TypeError: Network request failed]
						if(err.toString().indexOf('Network request failed')!=-1){
							Utils.msg('网络连接超时...');
							that.setState({
								isConnected:false
							});
						}

				   });
	}
	renderAddrItem(){
		let code = [];
		for(let i in addrData){
			let data = addrData[i];
			if(this.props.type==1){
				code.push(
						<TouchableOpacity key={i} style={[styles.addr_item]} onPress={()=>this.returnSettlement(data.addressId)}>
							<View style={styles.addr_info}>
									<Text>{data.userName} {data.userPhone}</Text>
									<Text>{data.areaName}-{data.userAddress}</Text>
								</View>
								<View style={[styles.row,styles.operation]}>
									<TouchableOpacity style={[styles.row,{alignItems:'center'}]} onPress={()=>this.setDefault(data.addressId)}>
										{
											data.isDefault?
											<Icon name={'dot-circle-o'} size={15} color={'red'} />
											:
											<Icon name={'dot-circle-o'} size={15} />
										}
										<Text>设为默认</Text>
									</TouchableOpacity>
									<View style={[styles.row]}>
										<Text style={{marginRight:10,}} onPress={()=>this.editAddr(data.addressId)}>
											<Icon name={'edit'} size={15} />
											 编辑
										</Text>
											
										<Text onPress={()=>this.delAddr(data.addressId)}>
											<Icon name={'trash-o'} size={15}  />
											 删除
										</Text>
									</View>
								</View>
						</TouchableOpacity>
					);
			}else{
				code.push(
						<View key={i} style={[styles.addr_item]}>
							<View style={styles.addr_info}>
								<Text>{data.userName} {data.userPhone}</Text>
								<Text>{data.areaName}-{data.userAddress}</Text>
							</View>
							<View style={[styles.row,styles.operation]}>
								<TouchableOpacity style={[styles.row,{alignItems:'center'}]} onPress={()=>this.setDefault(data.addressId)}>
									{
										data.isDefault?
										<Icon name={'dot-circle-o'} size={15} color={'red'} />
										:
										<Icon name={'dot-circle-o'} size={15} />
									}
									<Text>设为默认</Text>
								</TouchableOpacity>
								<View style={[styles.row]}>
									<Text style={{marginRight:10,}} onPress={()=>this.editAddr(data.addressId)}>
										<Icon name={'edit'} size={15} />
										 编辑
									</Text>
										
									<Text onPress={()=>this.delAddr(data.addressId)}>
										<Icon name={'trash-o'} size={15}  />
										 删除
									</Text>
								</View>
							</View>
						</View>
						
				);
			}
					
		}
		return code;
	}


	addAddr(){
		this.props.navigator.push({
			component:Edit,
			passProps:{
				title:'新增收货地址',
				addressId:0,
				refresh:this.refresh
			}
		})
	}
	editAddr(addressId){
		this.props.navigator.push({
			component:Edit,
			passProps:{
				title:'编辑收货地址',
				addressId:addressId,
				refresh:this.refresh
			}
		})
	}
	delAddr(addressId){
		let that = this;
		Alert.alert(
			'提示',//弹出框标题
            '确定要删除该地址么',//弹出框内容
            // 按钮设定
            [
              {text: '确定', onPress:()=>that.doDelAddr(addressId)},
              {text: '取消'},
            ]
		);
	}
	doDelAddr(addressId){
		let that = this;
		// 请求删除地址接口
		let url = Utils.domain+'app/useraddress/del';
		let postData = {
			tokenId:global.tokenId,
			id:addressId
		}
		Utils.post(
				   url,
				   postData,
				   function(responData){
				   		if(responData.status==1){
				   			Utils.msg(responData.msg);
				   			// 重新渲染数据
				   			that.getData();
				   		}else{
				   			Utils.msg(responData.msg);
				   		}
				   },
				   function(err){
				   		console.log(err);
				   });
	}
	// 设为默认地址
	setDefault(addressId){
		let that = this;
		// 请求默认地址接口
		let url = Utils.domain+'app/useraddress/setDefault';
		let postData = {
			tokenId:global.tokenId,
			id:addressId
		}
		Utils.post(
				   url,
				   postData,
				   function(responData){
				   		if(responData.status==1){
				   			Utils.msg(responData.msg);
				   			// 重新渲染数据
				   			that.getData();
				   		}else{
				   			Utils.msg(responData.msg);
				   		}
				   },
				   function(err){
				   		console.log(err);
				   });
	}


	// 渲染头部
	renderHeader(){
		return (
			<Header initObj={{backName:' ',title:'我的地址'}} 
					backEvent={()=>this.props.navigator.pop()} 
					showRight={true} 
					onPress={this.addAddr} 
					rightText={'新增'} />
		);
	}
	// 没有收货地址
	empty(){
		return (
			<View style={[styles.contrainer,styles.flex_1]}>
				{this.renderHeader()}
				<View style={[styles.flex_1,styles.center]}>
					<Text style={styles.empty}>没有收货地址</Text>
				</View>
			</View>
			);
	}
	render(){
		if(!this.state.isConnected){
	      return <Refresh refresh={this._onRefresh} /> ;
		}
		// 正在加载
		/*if(this.state.loading){
			return Utils.loading();
		}*/
		if(!this.state.hasData){
			return this.empty();
		}

		return(
			<View style={[styles.contrainer,styles.flex_1]}>
				{/*头部*/}
				{this.renderHeader()}
				<ScrollView style={styles.main}>
					{/* 地址 */}
					{this.renderAddrItem()}

				</ScrollView>
			</View>
		);
	};
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
		height:height-50
	},
	// 没有数据
	empty:{
		fontSize:20,
		fontWeight:'bold'
	},
	addr_item:{
		backgroundColor:'#fff',
		marginTop:10,
		paddingLeft:10,
		paddingRight:10,
	},
	addr_info:{
		borderBottomWidth:1,
		borderBottomColor:'#ccc',
		paddingBottom:5,
		marginBottom:5,
	},
	operation:{
		paddingTop:5,
		paddingBottom:5,
		justifyContent:'space-between',
		alignItems:'center'
	}
});