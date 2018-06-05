/**
* 搜索框
*/
import React,{Component} from 'react';
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	ListView,
	ScrollView,
	Image,
	TouchableOpacity,
} from 'react-native';
// 导入回退按钮
import LeftIcon from './../common/left_icon1';
// 导入图标库
import Icon from 'react-native-vector-icons/MaterialIcons';
// 店铺商品分类页面
import shopCat from './../shop_cat';

// 店铺详情
import ShopHome from './../shop_home';



export default class Search extends Component{
	constructor(props){
		super(props);
		this._textInputObj=null;
		this.state={
			inputText:this.props.value,
		}
		this.pressSearch = this.pressSearch.bind(this);
		this._pop = this._pop.bind(this);
		this.goShopCat = this.goShopCat.bind(this);
		this.recordText = this.recordText.bind(this);
	}

	doSearch(){
		this._textInputObj.blur();
		// 调用外部传过来的方法
		this.props.commit?this.props.commit(this.state.inputText):alert('请传入处理方法');
	}
	// 点击搜素按钮
	pressSearch(){
		// 执行搜索
		this._textInputObj.onSubmitEditing = this.doSearch();
	}
	// 记录用户输出的文本
	recordText(text){
		this.setState({
			inputText:text,
		});
	}

	render(){
		var obj = this.props;
		return(
			<View style={[styles.header, styles.row, styles.center]}>
				<TouchableOpacity style={[styles.row, styles.center]} onPress={this._pop}>
					<LeftIcon style={{width:15,height:15,borderLeftWidth:2,borderBottomWidth:2,marginRight:10,marginLeft:15}} />
					<Text style={styles.font}> </Text>
				</TouchableOpacity>

				<View style={[styles.flex_1,styles.search,styles.row,{position:'relative'}]}>
					<TouchableOpacity style={{position:'relative',top:8,right:3,marginLeft:10}} onPress={this.pressSearch}>
						{/*<Icon name="search" size={25}  color="#59595c"/>*/}
						<Image source={require('./../img/goods_search.png')} style={styles.searchLeftImg} />
					</TouchableOpacity>
					<TextInput 
						value={this.state.inputText}
						ref={(c)=>{this._textInputObj=c}}
						returnKeyType={'search'}
						underlineColorAndroid={'transparent'}
						placeholderTextColor={'#333'}
						placeholder={obj.placeholder}
						onSubmitEditing={this.pressSearch}
						style={[styles.flex_1,styles.input]}
						onChangeText={(val)=>this.recordText(val)}/>
				</View>
				{
					this.props.showRight
					?
					<TouchableOpacity style={styles.right} onPress={this.goShopCat}>
						<Text style={styles.font}>
							<Icon name="dehaze" size={25}  color="#59595c"/>
						</Text>
					</TouchableOpacity>
					:
					<View style={{width:30}}>
					</View>
				}
				

			</View>
		);
	}
	_pop(){
		//alert('返回按钮');
		this.props.navigator.pop();
	}

	// 进入店铺分类页面
	goShopCat(){
		this.props.navigator.push({
			component:shopCat,
			passProps:{
				shopId:this.props.shopId,
				tabSelected:0,
				click:this.clickType
			}
		});
	}
	// 点击分类
	clickType(ct1,ct2){
		//  替换上一个店铺页面,弹出当前页面;
		this.props.navigator.replacePrevious({
			component:ShopHome,
			passProps:{
				shopId:this.props.shopId,
				ct1:ct1,
				ct2:ct2,
			}
		});

		this.props.navigator.pop();

		/*this.props.navigator.push({
			component:ShopHome,
			passProps:{
				shopId:this.props.shopId,
				ct1:ct1,
				ct2:ct2,
			}
		});*/


	}
}
const styles = StyleSheet.create({
	row:{
		flexDirection:'row'
	},
	header:{
		height:45,		
		paddingTop:5,
		paddingBottom:5,
		backgroundColor:'#f5f5f5',
	},
	font:{
		color:'#59595c',
		fontSize:18,
		fontWeight:'bold'
	},
	flex_1:{
		flex:1
	},
	search:{
		borderWidth:1,
		borderColor:'#f5f5f5',
		borderRadius:30,
		backgroundColor:'#fff',
	},
	input:{
		height:35,
		paddingLeft:5,
		fontSize:22*0.5,
		color:'#333',
	},
	center:{
		justifyContent:'center',
		alignItems:'center',
	},
	right:{
		marginLeft:10,
		marginRight:10,
	},
	searchLeftImg:{
		width:18,
		height:18,
	},

});