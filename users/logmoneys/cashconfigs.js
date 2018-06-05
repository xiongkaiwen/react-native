/**
* 新增/编辑提现账号
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Picker,
  NetInfo
} from 'react-native';
// 显示刷新页面
import Refresh from './../../common/refresh';
//引入公共头部
import Header from '../../common/header';
//工具类
import Utils from '../../common/utils';
//我的提现账户
import CashconfigsList from './cashconfigs_list';

// 兼容ios
import SelectIos from './selectIos';
// ios地址选择
import AreaIos from './area';
// 数据
var banksData;
var accInfo;
var id;
var area1,area2,area3,area4;

export default class Cashconfigs extends Component {
	constructor(props){
		super(props);
        this.state= {
        	selectedValue: 0,
        	area1:0,
        	area2:0,
        	area3:0,
        	area4:0,
        	enabledArea2:false,
        	enabledArea3:false,
        	enabledArea4:false,
        	accUser:'',
        	accNo:'',
        }
        // 是否有网络
		this.state.isConnected = true;
		// 是否加载数据
		this.state.loading = true;
		id = this.props.id;
        
		this.success = this.success.bind(this);
		this.info = this.info.bind(this);
		this.editData = this.editData.bind(this);
		this.choseArea1 = this.choseArea1.bind(this);
		this.choseArea2 = this.choseArea2.bind(this);
		this.choseArea3 = this.choseArea3.bind(this);
		this.choseArea4 = this.choseArea4.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	banksData = data.data.banks;
	area1 = data.data.areas;
	if(data.data){
		this.setState({
			loading:false
		  });
		}
	}
	info(data){
		let that = this;
			Utils.get(
				Utils.domain+'app/cashconfigs/index?tokenId='+global.tokenId,
				(renderData)=>{
					// 当前为修改状态
					that._edit = true;
					banksData = renderData.data.banks;
					area1 = renderData.data.areas;

					accInfo = data.data;
					let setValue = {};
					setValue.accUser = accInfo.accUser
					setValue.accNo = accInfo.accNo
					// 设置地区选中
					let areaArr = accInfo.accAreaIdPath.split('_');
					console.log('areaArr',areaArr);
					if(global._platfrom == 'ios'){
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
					setValue.loading = false;
					that.setState(setValue);
					// 选中地址
					(global._platfrom=='ios')?null:that.choseArea1(parseInt(areaArr[0],10), true);
					that.changeNumber(accInfo.accTargetId);

				},
				this.requestFail);
			
			
	}

 // 获取数据
  getData(){
	if(id>0){
		//获取信息
		Utils.get(Utils.domain+'app/cashconfigs/getById?tokenId='+global.tokenId+'&id='+id,this.info,this.requestFail);
	}else{
		Utils.get(Utils.domain+'app/cashconfigs/index?tokenId='+global.tokenId,this.success,this.requestFail);
	}
	
  }
  requestFail(err){
  	console.log('账户提现页面报错',err);
  	// 网络请求超时或断网时 [TypeError: Network request failed]
	if(err.toString().indexOf('Network request failed')!=-1){
		Utils.msg('网络连接超时...');
		that.setState({
			isConnected:false
		});
	}
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
			loading:true
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
			// 禁用area3并且设置值为0,即请选择状态
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
	choseArea4(value){
		this.setState({area4: value});
		if(this._edit){
			this.defaultArea1 = 0;
			this.defaultArea2 = 0;
			this.defaultArea3 = 0;
			this.defaultArea4 = 0;
		}
	}
  //新增/编辑
  editData(){
	let that = this;
	let accTargetId = this.state.selectedValue;
	let accAreaId = this.state.area4;
	let accUser  = this.state.accUser;
	let accNo = this.state.accNo;
	if(accTargetId==0){
		Utils.msg('请选择账户类型');
		return;
	}
	if(accAreaId==0){
		Utils.msg('请选择完整地址');
		return;
	}
	if(accUser==''){
		Utils.msg('请输入持卡人');
		return;
	}
	if(accNo==''){
		Utils.msg('请输入卡号');
		return;
	}
	if(id>0){
		url = 'edit';
	}else{
		url = 'add';
	}
	// 请求接口
	Utils.post(Utils.domain+'app/cashconfigs/'+url,
		{tokenId:global.tokenId,accTargetId:accTargetId,accAreaId:accAreaId,accUser:accUser,accNo:accNo,id:id},
		(responData)=>{
			if(responData.status==1){
				Utils.msg(responData.msg);
				// 重新请求数据渲染页面
				that.props.navigator.pop();
			}else{
				Utils.msg(responData.msg);
			}
		},
		(err)=>{
			Utils.msg('保存失败');
		});
  }
  //账户类型
  changeNumber(value){
    this.setState({selectedValue: value});
  }
  numberData(data){
	let num = [];
	num.push(<Picker.Item  key="0" label="请选择" value="0"/>);
	if(data.length>0){
		for(let i in data){
			num.push(<Picker.Item  key={data[i]['bankId']} label={data[i]['bankName']} value={data[i]['bankId']}/>);
		}
	}
	return num;
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

  // 渲染头部
  renderHeader(){
	  return(<Header initObj={{backName:'',title:id>0?'编辑提现账号':'新增提现账号'}} navigator={this.props.navigator}/>);
  }
  /**********************  兼容ios ***************************/
  renderIosAccount(){
  	let _arr = [];
  	let _initval,_initvalName;
  	for(let i in banksData){
        let item = banksData[i];
        _arr.push({
            key:item.bankId,
            label:item.bankName
        });
        if(accInfo!=undefined && accInfo.accTargetId!=undefined && item.bankId==accInfo.accTargetId){
        	_initval = item.bankId;
        	_initvalName = item.bankName;
        }
    }
  	return(<SelectIos 
  			initVal={_initval}
  			initValName={_initvalName}
	 		data={_arr}
	 		selected={this.changeNumber.bind(this)} />);
  }
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}	
	// 请求数据中
	if(this.state.loading){
		return Utils.loading();
	}
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
	         <View style={styles.login}>
	         	<View style={styles.column}>
	         		 <Text style={styles.columnl}>账户类型：</Text>
	         		 {
	         		 	global._platfrom=='ios'
	         		 	?
	         		 	this.renderIosAccount()
	         		 	:
	         		 	<Picker style={styles.account}
			                //显示选择内容
			                selectedValue={this.state.selectedValue}
			                //选择内容时调用此方法
				         	onValueChange={(value)=>{this.changeNumber(value)}}
			              >
				          {this.numberData(banksData)}
			             </Picker>
	         		 }
				         

	         	</View>
	         	<View style={styles.column}>
	        		 <Text style={styles.columnl}>省：</Text>
	        		 {
						global._platfrom=='ios'
						?
						<AreaIos 
						initVal={this.defaultArea1}
						data={area1} 
						selected={this.choseArea1} />
						:
			         <Picker style={styles.account}
		                //显示选择内容
		                selectedValue={this.state.area1}
		                //选择内容时调用此方法
			         	onValueChange={(value)=>{this.choseArea1(value)}}
		              >
			          {this.renderArea(area1)}
		              </Picker>
		             }

	        	</View>
	         	<View style={styles.column}>
		    		 <Text style={styles.columnl}>市：</Text>
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
				         <Picker style={styles.account}
				           enabled={this.state.enabledArea2}
			               //显示选择内容
			               selectedValue={this.state.area2}
			               //选择内容时调用此方法
				         	onValueChange={(value)=>{this.choseArea2(value)}}
			             >
				          {this.renderArea(area2)}
			             </Picker>
			         }

		    	</View>
		     	<View style={styles.column}>
					 <Text style={styles.columnl}>县：</Text>
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
				        <Picker style={styles.account}
				           enabled={this.state.enabledArea3}
				           //显示选择内容
				           selectedValue={this.state.area3}
				           //选择内容时调用此方法
				        	onValueChange={(value) => this.choseArea3(value)}
				         >
				         {this.renderArea(area3)}
				         </Picker>
			         }
				</View>
				<View style={styles.column}>
					 <Text style={styles.columnl}>乡/镇/街道：</Text>
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
				        <Picker style={styles.account}
				           enabled={this.state.enabledArea4}
				           //显示选择内容
				           selectedValue={this.state.area4}
				           //选择内容时调用此方法
				        	onValueChange={(value) => this.setState({area4: value})}
				         >
				         {this.renderArea(area4)}
				         </Picker>
			         }
				</View>
	         	<View style={styles.column}>
		         	<Text style={styles.columnl}>持卡人：</Text>
		         	<TextInput style={styles.logininput} underlineColorAndroid={'transparent'} defaultValue={this.state.accUser} onChangeText={(val)=>this.setState({accUser:val})}/>
	         	</View>
	         	<View style={styles.column}>
		         	<Text style={styles.columnl}>卡号：</Text>
		         	<TextInput 
		         		style={styles.logininput} 
		         		underlineColorAndroid={'transparent'} 
		         		value={this.state.accNo}
		         		onChangeText={(val)=>this.setState({accNo:val.replace(/\D/g,'')})}/>
	         	</View>
	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.editData}><Text style={styles.button}>保存</Text></TouchableOpacity>
	         </View>
	    </ScrollView>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#f6f6f8',
   },
   login:{
	   marginTop: 10,
	   backgroundColor: '#ffffff',
	   padding:10,
	   paddingBottom:0
   },
   column:{
	   flexDirection: 'row',
	   paddingBottom:10
   },
   columnl:{
	   width:Utils.width*0.23,
	   height:40,
	   lineHeight: 28
   },
   account:{
	   width: Utils.width*0.7,
	   height:40
   },
   logininput:{
	   width: Utils.width*0.7,
	   height:40,
	   borderColor: '#a0a0a0',
	   borderWidth:1,
	   marginBottom: 10,
	   borderRadius: 2
   },
   tologin:{
	   marginTop: 35,
	   paddingLeft:10,
	   paddingRight:10
   },
   button:{
	   color: '#ffffff',
	   textAlign: 'center',
	   borderRadius: 3,
	   height:40,
	   fontSize: 15,
	   lineHeight: 30,
	   backgroundColor: '#e00102',
   }
});