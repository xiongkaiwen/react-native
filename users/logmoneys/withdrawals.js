/**
* 申请提现
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
//资金管理
import Moneys from './logmoneys';
// 提现记录
import Cashdraws from './cashdraws';
// 兼容ios下拉框
import ModalDropdown from './ModalDropdown';
// 数据
var accountData,drawCashLimit;

export default class Withdrawals extends Component {
	constructor(props){
		super(props);
        this.state= {
        	selectedValue: this.props.id,
        	money:'',
        	cashPayPwd:''
        }
        this.accDataArr = {};
        // 是否有网络
		this.state.isConnected = true;
		// 是否加载数据
		this.state.loading = true;
		
		this.success = this.success.bind(this);
		this.drawMoney = this.drawMoney.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	// 最低提现金额
	drawCashLimit = data.data.drawCashLimit;
	accountData = data.data.list;
	if(data){
		this.setState({
			loading:false
		  });
		}
	}

 // 获取数据
  getData(){
  	let that = this;
	Utils.get(Utils.domain+'app/cashconfigs/pageQuery?tokenId='+global.tokenId,this.success,function(err){
		  		console.log('提现页面报错',err);
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
  //提现
  drawMoney(){
	let that = this;
	let account = this.state.selectedValue;
	let money  = this.state.money;
	let cashPayPwd = this.state.cashPayPwd;
	if(account==0){
		Utils.msg('请选择提现账号');
		return;
	}
	if(money==''){
		Utils.msg('请输入提现金额');
		return;
	}
	if(parseInt(money) < parseInt(drawCashLimit)){
		Utils.msg('提现金额不能低于'+drawCashLimit);
		return;
	}
	if(cashPayPwd==''){
		Utils.msg('请输入支付密码');
		return;
	}
	// 请求接口
	Utils.post(Utils.domain+'app/cashdraws/drawMoney',
		{tokenId:global.tokenId,accId:account,money:money,payPwd:cashPayPwd},
		responData=>{
			if(responData.status==1){
				Utils.msg('提交成功');
				// 重新请求数据渲染页面
				that.props.navigator.pop();
			}else{
				Utils.msg(responData.msg);
			}
		},
		err=>{
			console.log('提交失败',err);
			Utils.msg('提交失败');
		});
  }
  //账户
  changeNumber(value){
    this.setState({selectedValue: this.accDataArr[value]});
  }
  numberData(data){
	let num = [];
	num.push(<Picker.Item  key="0" label="请选择" value="0"/>);
	if(data.length>0){
		for(let i in data){
			num.push(<Picker.Item  key={data[i]['id']} label={data[i]['accUser']+'|'+data[i]['accNo']} value={data[i]['id']}/>);
		}
	}
	return num;
  }
  renderOptions=(data)=>{
  	let code = [];
  	for(let i in data){
  		let dataVal = data[i]['bankName']+' (尾号'+data[i]['accNo'].substr(-4,4)+')';
  		let value = data[i]['id'];
  		this.accDataArr[dataVal] = value;
  		code.push(dataVal);
  	}
  	return code;
  }

  // 渲染头部
  renderHeader(){
	  return(<Header 
				style={{backgroundColor:'#F61628'}}
	  			leftStyle={{borderColor:'#fff'}}
	  			titleTextStyle={{color:'#fff'}}
				initObj={{backName:'',title:'提现'}} 
				showRight={true}
				rightStyle={{position:'absolute',right:5}}
				rightText={'提现记录'}
				onPress={()=>this.props.navigator.push({component:Cashdraws})}
				rightTextStyle={{fontSize:14,color:'#fff'}}
				navigator={this.props.navigator} />);
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
	         	<View style={[styles.column,{position:'relative',marginTop:0}]}>
	         		 <Text style={styles.columnl}>提现账号</Text>
					 <ModalDropdown 
					 	onDropdownWillShow={()=>this.setState({accountShow:1})}
						onDropdownWillHide={()=>this.setState({accountShow:0})}
				        dropdownStyle={{width:Utils.width}}
				        dropdownTextStyle={{fontSize: 15,color:'#050101',marginLeft:10}}
				        textStyle={{fontSize: 15,color:'#050101'}}
				        defaultValue={this.props.defalutValue}
				        style={[{flex:1,height:40,justifyContent:'center',marginLeft:10}]}
                        onSelect={(rowId,rowData)=>this.changeNumber(rowData)}
                        options={this.renderOptions(accountData)}/>
                        {
                        	this.state.accountShow
                        	?
                     		<Image source={require('./../../img/btn_fold_s.png')} style={{position:'absolute',right:10,alignSelf:'center'}} />
                     		:
                     		<Image source={require('./../../img/btn_fold_n.png')} style={{position:'absolute',right:10,alignSelf:'center'}} />
                        }
	         	</View>
	         	<View style={styles.column}>
		         	<Text style={styles.columnl}>提现金额</Text>
		         	<TextInput style={styles.logininput} 
		         		placeholder={'请输入提现金额'}
		         		underlineColorAndroid={'transparent'} 
		         		value={this.state.money}
		         		onChangeText={(val)=>this.setState({money:val.replace(/\D/g, "")})}/>
	         	</View>
	         	<View style={styles.column}>
		         	<Text style={styles.columnl}>支付密码</Text>
		         	<TextInput style={styles.logininput} 
		         		placeholder={'请输入支付密码'}
		         		underlineColorAndroid={'transparent'} 
		         		secureTextEntry={true} 
		         		maxLength={6} 
		         		onChangeText={(val)=>this.setState({cashPayPwd:val})}/>
	         	</View>
	         	<View style={styles.time_box}>
	         		<Text style={styles.c11_666}>预计到账时间：
	         			<Text style={styles.c11_050}>24小时内到账</Text>
	         		</Text>
	         	</View>
	         </View>
	         <View style={styles.tologin}>
	         	<TouchableOpacity onPress={this.drawMoney}>
	         		<Text style={styles.button}>提交</Text>
	         	</TouchableOpacity>
	         </View>
	    </ScrollView>
	    </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#eee',
   },
   login:{
	   paddingBottom:0
   },
   center:{
	justifyContent:'center',
	alignItems:'center',
   },
   column:{
	   paddingHorizontal:20,
	   paddingVertical:5,
   	   backgroundColor: '#fff',
   	   marginTop:5,
	   flexDirection: 'row',
   },
   columnl:{
	   height:40,
	   lineHeight: 30,
	   fontSize: 15,
	   color:'#050101',
   },
   account:{
	   width: Utils.width*0.7,
	   height:40
   },
   logininput:{
	   width: Utils.width*0.7,
	   height:40,
	   borderWidth:0,
	   borderRadius: 2,
	   fontSize: 15,
   },
   time_box:{
	marginTop:14,
	marginLeft:22,
	marginBottom:5,
   },
   c11_666:{
   	fontSize: 11,
   	color:'#666'
   },
   c11_050:{
   	fontSize: 11,
   	color:'#050101'
   },
   tologin:{
	   marginTop: 35,
	   paddingHorizontal:20,
   },
   button:{
	   color: '#ffffff',
	   textAlign: 'center',
	   borderRadius: 5,
	   height:40,
	   fontSize: 18,
	   lineHeight: 30,
	   backgroundColor: '#E60012',
   }
});