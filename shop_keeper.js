/**
* 成为店长页面
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  NetInfo,
  Image,
  InteractionManager,
  TouchableOpacity
} from 'react-native';
//工具类
import Utils from './common/utils';
let {width,height} = Utils;
//引入公共头部
import Header from './common/header';
// 卖货商级别申请页面
import DistributeList from './users/distribute/distribute_list';
var userInfo;
export default class ShopKeeper extends Component {
	constructor(props){
		super(props);
		this.state = {
			loading:true,
		}
	}
	getData=()=>{
		Utils.get(Utils.domain+'app/users/index?tokenId='+global.tokenId,
			responData=>{
				userInfo = responData.data;
				this.setState({loading:false});
			},
			err=>{
				console.log('成为店长报错',err);
			});
	}
	// 渲染卖货级别
	  renderShareRank(){
	  	let code;
		switch(userInfo.shareRank){
			case 1:
				code = '钻石会员';
			break;
			case 2:
				code = '黄金会员';
			break;
			case 3:
				code = '白银会员';
			break;
			default:
				code = '会员';
			break;
		}
	  	return code;
	  }
  // 组件挂载完毕
  componentDidMount(){
  	InteractionManager.runAfterInteractions(() => {
		  	// 检测网络状态
			NetInfo.isConnected.fetch().done((isConnected) => {
			  if(isConnected || global._platfrom=='ios'){
				// 调用方法请求数据
				this.getData();
			  }else{
			  	Utils.msg('当前无网络连接');
				// 当前无网络连接
				this.setState({
				  isConnected:false,
				});
			  }
			});
	});	
  }
  // 渲染头部
  renderHeader(){
	  return(<Header 
				style={{backgroundColor:'#F61628'}}
	  			leftStyle={{borderColor:'#fff'}}
	  			titleTextStyle={{color:'#fff'}}
				initObj={{backName:'',title:'成为白银会员'}} 
				navigator={this.props.navigator} />);
  }
  render() {
    return (
    	<View style={styles.container}>
    		{this.renderHeader()}
    		<View style={[styles.user_info,styles.row]}>
    			<View style={styles.uif_l}>
    				<View style={styles.photo_box}>
    					{
	  						userInfo!=undefined
	  						?
	  						<Image source={{uri:Utils.WSTUserPhoto(userInfo.domain,userInfo.userPhoto)}} style={styles.photo}/>
	  						:
	  						null
	  					}
    				</View>
    			</View>
    			<View style={styles.uif_r}>
    				<Text style={styles.c15_050}>
    				{
    					!this.state.loading
    					?
						this.renderShareRank()
						:
						null
    				}
    				</Text>
    				{
    					userInfo!=undefined
    					?
    					<Text style={[styles.c15_050,styles.c12]}>{userInfo.userName?userInfo.userName:userInfo.loginName}</Text>
    					:
    					null
    				}
    			</View>
    		</View>
    		<View style={styles.main}>
				<View style={styles.main_tit}>
					<Text style={styles.c14_050}> 店长特权</Text>
				</View>
				<View style={styles.tips_box}>
					<View style={[styles.tips_item,styles.row]}>
						<View style={styles.tips_item_l}>
							<Image source={require('./img/img_QR.png')} style={styles.item_img} />
						</View>
						<View style={styles.tips_item_r}>
							<Text style={styles.c15_050}>独立店铺</Text>
							<Text style={styles.c12_4d4}>拥有自己的商铺及推广二维码</Text>
						</View>
					</View>
					<View style={[styles.tips_item,styles.row]}>
						<View style={styles.tips_item_l}>
							<Image source={require('./img/img_profits.png')} style={styles.item_img} />
						</View>
						<View style={styles.tips_item_r}>
							<Text style={styles.c15_050}>白银会员特权</Text>
							<Text style={styles.c12_4d4}>您可以获得专享价及分享增值</Text>
						</View>
					</View>
				</View>
				<View style={styles.btnbox}>
					<TouchableOpacity 
						onPress={()=>{this.props.navigator.push({component:DistributeList,passProps:{userInfo:userInfo}})}}
						style={[styles.btn,styles.center]}
						activeOpacity={0.8}>
						<Text style={styles.c18_fff}>申请成为白银会员</Text>
					</TouchableOpacity>
				</View>
			</View>
    	</View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
	   flex: 1,
	   backgroundColor:'#eee',
   },
   center:{
		justifyContent:'center',
		alignItems:'center',
	},
	row:{flexDirection:'row'},
	header:{
		width:'100%',
		height:45,
		backgroundColor: '#F61628'
	},
	c18_fff:{
		fontSize: 18,
		color:'#fff'
	},
	c12:{
		fontSize: 12,
		opacity: 0.6,
		marginTop:5,
	},
	c15_050:{
		fontSize:15,
		color:'#050101'
	},
	user_info:{
		height:height*0.2,
		width:'100%',
		backgroundColor: '#FAFAFA',
		marginBottom:5,
	},
	uif_l:{
		paddingRight:10,
		paddingLeft:20,
		flex:1,
		justifyContent:'center',
		alignItems:'flex-end'
	},
	photo_box:{
		width: width*0.25,
		height:width*0.25,
	},
	photo:{
		width: width*0.25,
		height: width*0.25,
		borderRadius:width*0.25*0.5,
		overlayColor:'#FAFAFA',
	},
	uif_r:{
		justifyContent:'center',
		flex:3,
	},
	main:{
		height:height*0.8,
		width:'100%',
		backgroundColor:'#FAFAFA',
	},
	main_tit:{
		paddingVertical:20,
		paddingHorizontal:30,
	},
	c14_050:{
		fontSize: 14,
		color:'#050101',
	},
	tips_box:{
	},
	tips_item:{
		paddingVertical:20,
		paddingHorizontal:30,
	},
	tips_item_l:{
		paddingRight:20
	},
	item_img:{
		width:68*0.6,
		height:68*0.6,
	},
	tips_item_r:{
		flex:1,
	},
	c12_4d4:{
		fontSize: 12,
		color:'#4D4D4D'
	},
	btnbox:{
		width:'100%',
		marginTop:25,
		paddingHorizontal:20,
	},
	btn:{
		paddingVertical:10,
		backgroundColor: '#E60012',
		borderRadius: 5,
	}
});