/**
 * 工具类
 *
 */

'use strict';
import React from 'react';
import {
    Dimensions,
    ActivityIndicator,
    PixelRatio
} from 'react-native';
// 提示消息组件
import Toast from 'react-native-root-toast';
let Util = {
    /**
    * 屏幕宽高
    */
    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
    /**
    * 最小线宽
    */
    pixel:1/PixelRatio.get(),
    /**
     * http get 请求简单封装
     * @param url 请求的URL
     * @param successCallback 请求成功回调
     * @param failCallback 请求失败回调
     */
    get: (url, successCallback, failCallback) => {
        fetch(url)
            .then((response) => response.text())
            .then((responseText) => {
                successCallback(JSON.parse(responseText));
            })
            .catch((err) => {
                failCallback(err);
            });
    },

    /**
     * http post 请求简单封装
     * @param url 请求的URL
     * @param data post的数据
     * @param successCallback 请求成功回调
     * @param failCallback failCallback 请求失败回调
     */
    post: (url, data, successCallback, failCallback) => {
        let formData = new FormData();
        for(let key in data){
            formData.append(key,data[key]);
        }
        let fetchOptions = {
            method: 'POST',
            headers: {},
            body: formData
        };

        fetch(url, fetchOptions)
            .then((response) => {
                if(response.status==200){// 请求成功
                    return response.text()
                }
                /*
                response.text().then(info=>{
                    let reg = /<h1>.*<\/h1>/;
                    let errMsg = reg.exec(info);
                })
                */
                throw new Error('url请求失败'+response.status);
            })
            .then((responseText) => {
                successCallback(JSON.parse(responseText));
            })
            .catch((err) => {
                failCallback(err);
            });
    },
    orderPay: (url, successCallback, failCallback) => {
        fetch(url)
            .then((response) => response.text())
            .then((responseText) => {
                successCallback(responseText);
            })
            .catch((err) => {
                failCallback(err);
            });
    },
    /**
     * 文件上传 
     * @param uri 图片路径
     * @param dir 服务器保存图片的文件夹
     * @param successCallback 请求成功回调
     * @param failCallback failCallback 请求失败回调
     */
     uploadImg:(uri, dir, successCallback, failCallback) => {
        let formData = new FormData();  
        let file = {uri: uri, type: 'multipart/form-data', name: 'app.jpg'};  
        let url = Util.domain+'app/users/uploadPic?tokenId='+global.tokenId+'&dir='+dir;
        formData.append("images",file);  
        fetch(url,{  
            method:'POST',  
            headers:{  
                'Content-Type':'multipart/form-data',  
            },  
            body:formData,  
        })  
        .then((response) => response.text())  
        .then((responseData)=>{  
            successCallback(JSON.parse(responseData));
        })  
        .catch((err)=>{
            failCallback(err);
        }); 
     },


    /**
     * 日志打印
     * @param obj
     */
    log: (obj) => {
        var description = "";
        for(let i in obj){
            let property = obj[i];
            description += i + " = " + property + "\n";
        }
        alert(description);
    },
    /**
    * 网站域名
    */
    domain:'http://www.isp-cn.com/',
    /**
    * loding效果
    */
    loading:()=>{return <ActivityIndicator size="large" style={{flex:1,justifyContent:'center',alignItems:'center'}} />},
    /**
    * 消息提示
    * msg: 要显示的文字
    * position enum('top','center','bottom') 提示消息的位置,默认为top
    * time:显示的时长.默认为2000毫秒
    * endCallback: 提示结束后的回调
    */
    msg:(msg, position, time, endCallback)=>{
                let location = '';
                switch(position){
                    case 'top':
                    location = Toast.positions.TOP;
                    break;
                    case 'center':
                    location = Toast.positions.CENTER;
                    break;
                    case 'bottom':
                    location = Toast.positions.BOTTOM;
                    break;
                    default:
                    location = Toast.positions.TOP;
                    break;
                }
                let options = {
                    position:location,
                    time:time?time:Toast.SHORT,
                    onHidden:()=>(typeof(endCallback)=='function')?endCallback():null,
                    shadow:false,
                };
                return Toast.show(msg, options)},
    /**
      * 用户头像处理函数
      * domain:图片地址域名部分【针对默认规则】
      * userPhoto:图片地址
      */
    WSTUserPhoto:(domain,userPhoto)=>{
        // 外网头像
        if(userPhoto && userPhoto.indexOf('http')!=-1){
            userPhoto = userPhoto;
        }else if(userPhoto){
            userPhoto  = domain+userPhoto;
        }else{
            if(!global.confInfo){
                Util.get(Util.domain+'app/index/confInfo',(data)=>{
                    global.confInfo = data.data;
                },(err)=>{
                    console.log('处理用户头像报错~',err)
                });
            }
            // 使用默认头像
            userPhoto  = domain+global.confInfo.userLogo;
        }
        return userPhoto;
    }
}


export default Util;