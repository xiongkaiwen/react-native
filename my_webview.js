/**
* 广告弹出页
*/
import React, { Component } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	WebView
} from 'react-native';
import Header from './common/header';
export default class MyWebView extends Component{
	constructor(props){
		super(props);
		this.state = {
			title:''
		}
	}
	componentDidMount(){
		if(this.props.url=='')this.props.navigator.pop();
	}
	onError(){
		// 网页加载失败。
		this.props.navigator.pop();
	}
	render(){
		return(
			<View style={{flex:1,}}>
				<Header initObj={{backName:'',title:this.state.title}} navigator={this.props.navigator} />
				<WebView 
					onNavigationStateChange={this.onNavigationStateChange}
					onError={()=>this.onError()}
				  	scalesPageToFit={true}
				  	source={{uri:this.props.url}} 
				  	style={{flex:1,overflow:'hidden'}} 
				  	startInLoadingState={true}
				    domStorageEnabled={true}
				    javaScriptEnabled={true} />
			</View>
			
		);
	}

	onNavigationStateChange = (navState) => {
	    this.setState({
	    	title:navState.title,
	    })
  };
}

