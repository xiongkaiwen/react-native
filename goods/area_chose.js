/**
 * 可配送区域展示
 */
import React,{Component} from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    Modal
} from 'react-native';
import Utils from './../common/utils';
export default class AreaChose extends Component{
    constructor(props){
        super(props);
        this.state = {};
        this.state = {
            showAddr:true,// 是否显示地址列表
            showlv1Name:true,// 是否显示该级tit
            showlv2Name:false,
            showlv3Name:false,
            showlv4Name:false,
            currLv1Name:'请选择',// 该级地区名称
            currLv2Name:'请选择',
            currLv3Name:'请选择',
            currLv4Name:'请选择',
            level1:false,// 该级别下地区是否显示
            level2:false,
            level3:false,
            level4:false,
            loading_1:true,// 加载中
            loading_2:true,
            loading_3:true,
            loading_4:true,
            modalVisible:false,// 是否显示
        }
        // 当前地区选择style
        this.currTitStyle = {borderBottomWidth:2,borderColor:'#d82a2e',paddingBottom:5,color:'#d82a2e'};
        this.lv1Bd = this.currTitStyle;
        this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
        // 地区数据
        this._data = [];
        // 用户地址数据
        this._addrData;
    }
    componentDidMount(){
        // this.getAreaData(0,1,'全国');
        this.getUserAddr();
    }
    // 查询用户地址
    getUserAddr(){
        let url = Utils.domain+'app/useraddress/pagequery';
        let postData = {
            tokenId:global.tokenId,
        }
        Utils.post(
            url,
            postData,
            responData=>{
                if(responData.status==1 && responData.data!=undefined &&responData.data.length>0){
                    // 存在用户地址列表
                    this._addrData = responData.data;
                }else{
                    // 没有用户地址数据
                    this.getAreaData(0,1,'全国');
                }
            },
            err=>{
                console.log('选择配送区域页面，请求用户地址出错',err);
                this.getAreaData(0,1,'全国');
            }
        )
    }

    // 获取可配送区域
    getAreaData(areaId,level,parentName){
       let url = Utils.domain+'app/goods/goodsAreasList'; 
       let postData = {
           id:this.props.goodsId,
           areaId:areaId,
       }
       Utils.post(
                  url,
                  postData,
                  (responData)=>{
                    if(responData.data==undefined){// 没有下级数据
                        // 隐藏当前级
                        this.setState({['showlv'+level+'Name']:false});
                        // 设置上一级选中
                        this['pressLv'+(level-1)+'Tit']();
                        this.pressLv4(areaId,parentName);
                        return;
                    }
                    this._data['level_'+level] = responData.data;
                    // 判断是否为全国配送
                    for(let i in this._data['level_'+level]){
                        let _obj = this._data['level_'+level][i];
                        if(_obj.areaId==0){
                            this.isCountry = true;
                            break;
                        }
                    }

                    this.setState({['loading_'+level]:false,showAddr:false,['level'+level]:true});
                  },
                  (err)=>{
                      alert('数据请求失败，请重试');
                      console.log('可配送区域数据请求失败',err);
                  },
                )
    }
    pressLv1Tit(){// 点击第一级地区title
        this.lv1Bd = this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
        this.lv1Bd = this.currTitStyle;
        this.setState({
            level1:true,
            level2:false,
            level3:false,
            level4:false,
        });
    }
    pressLv2Tit(){// 点击第二级地区title
        this.lv1Bd = this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
        this.lv2Bd = this.currTitStyle;
        this.setState({
            level1:false,
            level2:true,
            level3:false,
            level4:false,
        });
    }
    pressLv3Tit(){// 点击第三级地区title
        this.lv1Bd = this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
        this.lv3Bd = this.currTitStyle;
        this.setState({
            level1:false,
            level2:false,
            level3:true,
            level4:false,
        });
    }
    pressLv4Tit(){// 点击第三级地区title
        this.lv1Bd = this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
        this.lv4Bd = this.currTitStyle;
        this.setState({
            level1:false,
            level2:false,
            level3:false,
            level4:true,
        });
    }
    pressLv1(areaId,areaName){// 点击第一级地区item
        // 设置title样式
        this.lv1Bd = this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
        this.lv2Bd = this.currTitStyle;
        let obj = {};
        // 1.设置第一级选中的地区名称
        obj.currLv1Name = areaName;
        // 2.隐藏第一级地区选择，显示第二级地区选择(数据请求)、显示第二级title并设置为`请选择`
        obj.level1 = false;
        obj.level2 = true;
        obj.showlv2Name = true;
        obj.currLv2Name = '请选择';
        // 3.隐藏第三、四级title、
        obj.showlv3Name = false;
        obj.showlv4Name = false;
        // 4.设计其他级的loading
        obj.loading_2 = true;
        obj.loading_3 = true;
        obj.loading_4 = true;
        // 请求接口执行查询
        this.getAreaData(areaId,2,areaName);
        this.setState(obj);
    }
    pressLv2(areaId,areaName){// 点击第二级地区item
        // 设置title样式
        this.lv1Bd = this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
        this.lv3Bd = this.currTitStyle;
        let obj = {};
        // 1.设置第二级选中的地区名称
        obj.currLv2Name = areaName;
        // 2.隐藏第一、二级地区选择，显示第三级地区选择(数据请求)、显示第三级title
        obj.level1 = false;
        obj.level2 = false;
        obj.level3 = true;
        obj.showlv3Name = true;
        obj.currLv3Name = '请选择';
        // 3.隐藏第四级title、
        obj.showlv4Name = false;
        // 4.设计其他级的loading
        obj.loading_3 = true;
        obj.loading_4 = true;
        // 请求接口执行查询
        this.getAreaData(areaId,3,areaName);
        this.setState(obj);
    }
    pressLv3(areaId,areaName){// 点击第三级地区item
        // 设置title样式
        this.lv1Bd = this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
        this.lv4Bd = this.currTitStyle;
        let obj = {};
        // 1.设置第三级选中的地区名称
        obj.currLv3Name = areaName;
        // 2.隐藏第一、二、三级地区选择，显示第四级地区选择(数据请求)、显示第四级title
        obj.level1 = false;
        obj.level2 = false;
        obj.level3 = false;
        obj.level4 = true;
        obj.showlv4Name = true;
        obj.currLv4Name = '请选择';
        // 4.设计其他级的loading
        obj.loading_4 = true;
        // 请求接口执行查询
        this.getAreaData(areaId,4,areaName);
        this.setState(obj);
    }
    pressLv4(areaId,areaName,level){// 点击第四级地区item
        let obj = {};
        obj.modalVisible = false;
        if(level==4){
            // 设置title样式
            this.lv1Bd = this.lv2Bd = this.lv3Bd = this.lv4Bd = {};
            this.lv4Bd = this.currTitStyle;
            // 1.设置第四级选中的地区名称
            obj.currLv4Name = areaName;
        }
        this.setState(obj);
        let _areaName,areaName1='',areaName2='',areaName3='',areaName4='';
        if(this.state.currLv1Name!='请选择'){
            areaName1 = this.state.currLv1Name;
        }
        if(this.state.currLv2Name!='请选择'){
            areaName2 = '>'+this.state.currLv2Name;
        }
        if(this.state.currLv3Name!='请选择'){
            areaName3 = '>'+this.state.currLv3Name;
        }
        if(level==4){
            areaName4 = '>'+areaName;
        }
        _areaName = areaName1+areaName2+areaName3+areaName4;
        this.props.doneChose(areaId,_areaName);
    }
    renderAreaItem(level){
        if(this.state['loading_'+level])return Utils.loading();
        let currIndex = `currLv${level}Name`;
        let code = [];
        for(let i in this._data['level_'+level]){
            let _obj = this._data['level_'+level][i];
            if(_obj.areaId==0){
                break;
            }
            let _curr = {};
            if(this.state[currIndex]==_obj.areaName)_curr={color:'#d82a2e'};
            code.push(
                <TouchableOpacity key={_obj.areaId} style={styles.area_item} onPress={()=>this['pressLv'+level](_obj.areaId,_obj.areaName,level)}>
                    <Text style={_curr}>{_obj.areaName}</Text>
                </TouchableOpacity>
            );
        }
        return code;
    }
    // 存在用户地址,渲染用户地址
    renderAddrList(){
        let code = [];
        let _sty = [];// 选中时文字样式
        let _imgsty = [];// 选中时图片样式
        for(let i in this._addrData){
            let _obj = this._addrData[i];
            _sty[_obj.addressId] = {};
            _imgsty[_obj.addressId] = {};
            if(_obj.addressId==this.props.currIndex){
                _sty[_obj.addressId]={color:'#d82a2e'};
                _imgsty[_obj.addressId]={tintColor:'#d82a2e'};
            }
            code.push(
                <TouchableOpacity 
                    key={_obj.addressId} 
                    activeOpacity={0.8} 
                    onPress={()=>this.clickAddrItem(_obj.areaId,_obj.areaName+_obj.userAddress,_obj.addressId)}
                    style={[styles.addr_item,styles.row]}>
                    <Image source={require('./../img/adress.png')} style={[styles.addr_img,_imgsty[_obj.addressId]]} />
                    <Text style={[_sty[_obj.addressId]]}>{_obj.areaName}{_obj.userAddress}</Text>
                </TouchableOpacity>
            );
        }
        return code;
    }
    // 点击地址
    clickAddrItem(areaId,areaName,addrId){
        // 请求接口,将该地址设置为默认地址
        let url = Utils.domain+'app/useraddress/setDefault';
        let postData = {
            tokenId:global.tokenId,
            id:addrId
        }
		Utils.post(
				   url,
				   postData,
				   (responData)=>{return true},
				   (err)=>{
				   		console.log('设置默认地址失效',err);
				   });
        // 关闭遮罩层
        this.setState({modalVisible:false});
        this.props.doneChose(areaId,areaName,addrId);
    }
    // 点击选择其它地址
    selectArea(){
        this.getAreaData(0,1,'全国');
    }
    // 点击返回到地址列表
    backAddrList(){
        this.pressLv1Tit();
        this.setState({
            showAddr:true,
            level1:false,
            level2:false,
            level3:false,
            level4:false,
        })
    }
    render(){
        return(
        <Modal
            animationType={"fade"}
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={()=>this.setState({modalVisible:false})}
            >
            <View style={{backgroundColor:'rgba(0,0,0,0.5)',flex:1,}}>
                <View style={styles.contrainer}>
                    <View style={[styles.row,styles.header]}>
                        {!this.state.showAddr && this._addrData!=undefined?<Text onPress={()=>this.backAddrList()}>返回</Text>:null}
                        <Text style={[styles.flex_1,styles.header_tit]}>可配送区域</Text>
                        <TouchableOpacity 
                            style={styles.close_iconbox}
                            activeOpacity={0.8} 
                            onPress={()=>this.setState({modalVisible:false})}>
                            <Text style={styles.close_icon}>X</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.showAddr==true && this._addrData!=undefined
                        ?
                        <View style={styles.flex_1}>
                            <ScrollView>{this.renderAddrList()}</ScrollView>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={()=>this.selectArea()}
                                style={[styles.center,styles.other_addr_btn]}>
                                <Text style={styles.c15_fff}>选择其它地址</Text>
                            </TouchableOpacity>
                        </View>
                        :
                        this.isCountry!=undefined
                        ?
                        <Text>全国配送</Text>
                        :
                        <View style={[styles.c_head,styles.row]}>
                            {
                                this.state.showlv1Name
                                ?
                                <TouchableOpacity onPress={()=>this.pressLv1Tit()} style={{}}>
                                    <Text style={[styles.c_head_item,this.lv1Bd]}>{this.state.currLv1Name}</Text>
                                </TouchableOpacity>
                                :
                                null
                            }
                            {
                                this.state.showlv2Name
                                ?
                                <TouchableOpacity onPress={()=>this.pressLv2Tit()} style={{}}>
                                    <Text style={[styles.c_head_item,this.lv2Bd]}>{this.state.currLv2Name}</Text>
                                </TouchableOpacity>
                                :
                                null
                            }
                            {
                                this.state.showlv3Name
                                ?
                                <TouchableOpacity onPress={()=>this.pressLv3Tit()} style={{}}>
                                    <Text style={[styles.c_head_item,this.lv3Bd]}>{this.state.currLv3Name}</Text>
                                </TouchableOpacity>
                                :
                                null
                            }
                            {
                                this.state.showlv4Name
                                ?
                                <TouchableOpacity onPress={()=>this.pressLv4Tit()} style={{}}>
                                    <Text style={[styles.c_head_item,this.lv4Bd]}>{this.state.currLv4Name}</Text>
                                </TouchableOpacity>
                                :
                                null
                            }
                        </View>
                        
                        
                    }
                    {/* 第一级 */}
                    {
                        this.state.level1
                        ?
                        <ScrollView style={styles.area_list}>
                            {this.renderAreaItem(1)}
                        </ScrollView>
                        :
                        null
                    }
                    {/* 第二级 */}
                    {
                        this.state.level2
                        ?
                        <ScrollView style={styles.area_list}>
                            {this.renderAreaItem(2)}
                        </ScrollView>
                        :
                        null
                    }
                    
                    {/* 第三级 */}
                    {
                        this.state.level3
                        ?
                        <ScrollView style={styles.area_list}>
                            {this.renderAreaItem(3)}
                        </ScrollView>
                        :
                        null
                    }
                    {/* 第四级 */}
                    {
                        this.state.level4
                        ?
                        <ScrollView style={styles.area_list}>
                        {this.renderAreaItem(4)}
                        </ScrollView>
                        :
                        null
                    }
                </View>
            </View>
        </Modal>
        );
    }
}

const styles = StyleSheet.create({
    contrainer:{
        flex:1,
        backgroundColor:'#fff',
        marginTop:Utils.height*0.55,
    },
    row:{
        flexDirection:'row'
    },
    center:{
        justifyContent:'center',
        alignItems:'center',
    },
    flex_1:{flex:1},
    header:{
        position:'relative',
        backgroundColor:'#f5f5f5',
        padding:5,
    },
    header_tit:{
        fontSize:16,
        color:'#999',
        textAlign:'center',
    },
    close_iconbox:{
        padding:5,
        paddingHorizontal:15,
        right:0,
        position:'absolute',
    },
    close_icon:{
        fontSize:16,
    },
    c_head:{
        paddingVertical:10,
    },
    c_head_item:{
        marginHorizontal:10
    },
    area_list:{
        paddingLeft:10,
    },
    area_item:{
        marginBottom:10,
    },
    addr_item:{
        paddingHorizontal:15,
        paddingVertical:8,
        borderBottomWidth:1,
        borderColor:'#eee',
        alignItems:'center',
    },
    addr_img:{
        width:21*0.65,
        height:23*0.65,
        marginRight:5,
    },
    other_addr_btn:{
        alignSelf:'flex-end',
        width:'100%',
        height:40,
        backgroundColor:'#d82a2e',
    },
    c15_fff:{color:'#fff',fontSize:15}
})