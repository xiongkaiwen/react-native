import React,{ Component } from 'react';
import {
	View,
	TouchableOpacity,
	Image,
	TextInput,
	Text,
	StyleSheet,
} from 'react-native';
//倒入antd-mobile
//import { Tabs} from 'antd-mobile';
//登录页面
import Login from './login';
// 城市选择页面
import SelectCity from './selectcity';
//我的消息
import Messages from './users/messages/messages';
// 商品列表页
import GoodsList from './goods/goods_list';
export default class IndexHeader extends Component{
	constructor(props){
		super(props);
		this.state = {
			head_opacity:1,
			msgNum:0,
			cityName:'定位中·',
		}
	}
	_setMsg(num){
		this.setState({msgNum:num})
	}
	_setOpacity(num){
		this.setState({head_opacity:num});
	}
	selectedCity(){
		this.props.navigator.push({
			component:SelectCity,
			passProps:{
				cityName:this.state.cityName,
				changeCity:this.props.changeCity
			}
		});
	}
	/****************************************** 顶部搜索框**************************************************/
  	doSearch(){
		_textInputObj.blur();
		// 进入商品列表页
		this.props.navigator.push({
			component:GoodsList,
			passProps:{goodsName:this.state.inputText}
		});
	}
	// 点击搜素按钮
	pressSearch(){
		// 执行搜索
		_textInputObj.onSubmitEditing = this.doSearch();
	}
	// 记录用户输出的文本
	recordText(text){
		this.setState({
			inputText:text,
		});
	}
    //判断是否为首页（因为首页和比的板式不一样，动态改变父级作用域中的isHome）
    _changeHome(value){
        if(value.url=='index'){
            this.props.changeHome('index');
        }else{
            this.props.changeHome();
        }

    }
  /***************************************** 顶部搜索框***************************************************/
	render(){
		return(
			<View>
                <View style={[styles.search,{backgroundColor:`rgba(246,22,40,${this.state.head_opacity})`}]}>
                    <TouchableOpacity style={[styles.searchLeft]} onPress={()=>this.selectedCity()}>
                        <Image source={require('./img/nav_localize_n.png')}
                               style={styles.addr_icon} />
                        <Text style={styles.city_name} numberOfLines={1}>{this.state.cityName}</Text>
                    </TouchableOpacity>
                    {/*中间搜索框*/}
                    <View style={[styles.searchCenter,styles.row,{position:'relative'}]}>
                        <TouchableOpacity style={{position:'relative',top:4,right:3}} onPress={()=>this.pressSearch()}>
                            <Image source={require('./img/nav_search.png')} style={styles.searchImg} />
                        </TouchableOpacity>
                        <TextInput
                            ref={(c)=>{_textInputObj=c}}
                            returnKeyType={'search'}
                            onSubmitEditing={()=>this.pressSearch()}
                            underlineColorAndroid={'transparent'}
                            placeholder={'年货盛宴'}
                            placeholderTextColor={'#666'}
                            style={[styles.flex_1,styles.input]}
                            onChangeText={(val)=>this.recordText(val)}/>
                    </View>
                    {/*消息中心*/}
                    <TouchableOpacity style={[styles.searchRight,styles.center]}
                                      onPress={()=>{
                                          global.isLogin
                                              ?
                                              this.props.navigator.push({component:Messages})
                                              :
                                              this.props.navigator.push({component:Login})
                                      }}>
                        {
                            this.state.msgNum>0
                                ?
                                <Image source={require('./img/nav_btn_msg_new.png')} style={styles.msg_icon} />
                                :
                                <Image source={require('./img/nav_btn_msg_empty.png')} style={styles.msg_icon} />
                        }
                    </TouchableOpacity>
                </View>
			</View>

		);
	}
}
const styles = StyleSheet.create({
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	flex_1:{
		flex:1,
	},
	row:{
		flexDirection:'row'
	},
	// 首页顶部搜索框
	search:{
		width:'100%',
		zIndex:999999,
		flexDirection:'row',
		height:42,		
		paddingTop:5,
		paddingBottom:5,
	},
	searchLeft:{
		width:78,
		flexDirection:'row',
		alignItems:'center',
		justifyContent:'center',
		marginRight:2,
	},
	addr_icon:{
		width:25,
		height:25,
	},
	city_name:{fontSize:13,color:'#fff',textAlign:'center',maxWidth:53},
	input:{
		alignItems:'center',
		justifyContent: 'center',
		height:37,
		paddingLeft:5,
		fontSize:13,
		color:'#666',
		marginTop:-2
	},
	searchCenter:{
		borderWidth:1,
		borderColor:'#fff',
		backgroundColor:'#fff',
		borderRadius:5,
		flex:1,
	},
	searchImg:{
		marginLeft:10,
		width:23,
		height:23
	},
	searchRight:{
		width:50,
		padding:5,
		position:'relative',
	},
	msg_icon:{
		width:25,
		height:25
	}
});