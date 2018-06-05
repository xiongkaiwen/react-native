/**
* 我的提现账户
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
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
//新增/编辑提现账号
import Cashconfigs from './cashconfigs';
// 提现记录
import Cashdraws from './cashdraws';
// 提现
import DrawCash from './withdrawals';

export default class CashconfigsList extends Component {
	constructor(props){
		super(props);
		this.state={};
		// 是否有网络
		this.state.isConnected = true;
		// 数据
	    var caslistData = {};
		// 是否有数据
		this.state.hasData = false;
		// 是否加载数据
		this.state.loadData = false;
		
		this.success = this.success.bind(this);
		this.toPopup = this.toPopup.bind(this);
		this.delAccount = this.delAccount.bind(this);
		this._onRefresh = this._onRefresh.bind(this);
	}
	//请求成功的回调方法
	success(data){
	caslistData = data;
	if(caslistData.data.list.length>0){

		this.setState({
			loadData:true,
		    hasData:true,
		  });
		}else{
			this.setState({
				loadData:true,
			 });
		}
	}

 // 获取数据
  getData(){
  	let that = this;
	Utils.get(Utils.domain+'app/cashconfigs/pageQuery?tokenId='+global.tokenId,this.success,function(err){
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
			loadData:false
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
  componentWillReceiveProps(nextProps){
	   // 重新加载数据
	   (global.tokenId)?this.getData():Utils.msg('您还未登录','center');
  }
  
  //删除
  toPopup(id){
	Alert.alert(
		'提示',//弹出框标题
        '确认要删除吗',//弹出框内容
        // 按钮设定
        [
          {text: '确定', onPress:()=>this.delAccount(id)},
          {text: '取消'},
        ]
	);
  }
  
  delAccount(id){
  		console.log('id',id);
	    let that = this;

		// 请求接口
		Utils.post(Utils.domain+'app/cashconfigs/del',
		{tokenId:global.tokenId,id:id},
		responData=>{
			console.log('responData',responData);
			if(responData.status==1){
				Utils.msg(responData.msg);
				// 重新请求数据渲染页面
				that.getData();
			}else{1
				Utils.msg(responData.msg);
			}
		},
		err=>{
			Utils.msg('删除失败');
		});

  }
  
  // 渲染头部
  renderHeader(){
	  return(<Header 
	  			initObj={{backName:'',title:'提现'}} 
	  			backEvent={()=>{this.props.navigator.pop()}} 
	  			showRight={true} 
	  			rightStyle={{position:'absolute',right:5}}
	  			rightTextStyle={{fontSize:14,color:'#fff'}}
	  			rightText={'提现记录'} 
	  			onPress={()=>{this.props.navigator.push({component:Cashdraws})}}/>);
  }
  
  //列表
  listData(){
	  var data = caslistData.data.list;
	  var listPannel = [];
	  for(let i in data){
	  	  let dataVal = data[i]['bankName']+' (尾号'+data[i]['accNo'].substr(-4,4)+')';
		  let list = <View key={data[i]['id']} style={styles.record}>
				  	 	<TouchableOpacity 
				  	 		style={styles.recordl} 
				  	 		onLongPress={()=>this.toPopup(data[i]['id'])}
				  	 		onPress={()=>this.props.navigator.push({
				  	 								component:DrawCash,
				  	 								passProps:{id:data[i]['id'],
				  	 								defalutValue:dataVal
				  	 							}})}>
				      	 	<Text style={styles.c15_050}>{dataVal}</Text>
				  	 	</TouchableOpacity>
				  	 	{/*<View style={{flex: 1,flexDirection: 'row'}}>
				  	 		<Image source={require('../../img/icon_adds_users_03.png')} style={styles.delimg}/>
				  	 		<TouchableOpacity onPress={()=>this.toPopup(data[i]['id'])}>
				  	 			<Text style={{marginTop: 15}}>删除</Text>
				  	 		</TouchableOpacity>
				  	 	</View>*/}
					 </View>;
		 listPannel.push(list);  
	  }
	  return listPannel;
  }
		
  render() {
  	if(!this.state.isConnected){
      return <Refresh refresh={this._onRefresh} /> ;
	}
	// 请求数据中
	if(!this.state.loadData){
		return Utils.loading();
	}
/*	// 没有数据
	if(!this.state.hasData){
		return this.empty();
	}*/
	
    return (
    	<View style={styles.container}>
    	{this.renderHeader()}
        <ScrollView>
        	<TouchableOpacity 
        		activeOpacity={0.8}
        		onPress={()=>{this.props.navigator.push({component:Cashconfigs,passProps:{id:0}})}}
        		style={[styles.add_account]}>
        		<Text style={styles.c20}> + </Text>
        		<Text style={styles.c15_050}>新增账户</Text>
        	</TouchableOpacity>
        	<View style={{marginTop:10,marginBottom:-1}}>
        		{this.listData()}
        	</View>
        	<View style={{marginTop: 20,marginLeft:20}}>
      	 		<Text style={[styles.c12_666]}>首次提现步骤：</Text>
      	 		<Text style={[styles.c12_666]}>1.设置支付密码和绑定手机号码</Text>
      	 		<Text style={styles.c12_666}>2.绑定您的微信钱包或银行卡</Text>
      	 	</View>
	    </ScrollView>
	    </View>
    );
  }
  
	// 数据为空
	empty(){
		return(
			<View style={styles.contrainer}>
				{this.renderHeader()}
				<View style={{marginTop:Utils.height*0.4,alignItems: 'center'}}><Text style={{fontSize:20,fontWeight:'bold'}}>您还没有提现账户。</Text></View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor: '#eee',
   },
   record:{
	   padding:10,
	   paddingHorizontal:20,
	   backgroundColor: '#ffffff',
	   flexDirection: 'row',
	   borderColor: '#eee',
	   borderTopWidth:0.5
   },
   recordl:{
	   width:Utils.width
   },
   delimg:{
	   marginTop: 15,
	   width:18,
	   height:18
   },
   c20:{fontSize: 20,paddingRight:10,},
   c15_050:{
	   fontSize: 15,
	   color:'#050101',
   },
   add_account:{
   		backgroundColor: '#fff',
		flexDirection:'row',
		alignItems:'center',
		padding:10,
		paddingHorizontal:20
   },
   c12_666:{
   	fontSize: 12,
   	color:'#666'
   }
});