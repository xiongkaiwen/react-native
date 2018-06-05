/**
* 请求数据中
*/
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions
} from 'react-native';
let {width,height} = Dimensions.get('window');
import Modal from 'react-native-root-modal';
export default class Requesting extends Component{
	constructor(props){
		super(props);
		this.state = {
			requesting:false
		};
	}
	render(){
		return(
			<Modal
			style={styles.modal}
			visible={this.state.requesting}>
					<View style={[styles.modal_main]}>
						<ActivityIndicator color={'gray'} size="large" style={styles.uploading} />
						<Text style={styles.modal_text}>{this.props.msg}</Text>
					</View>
			</Modal>
		);
	}
}
const styles = StyleSheet.create({
	modal:{
		top: 0,
	    right: 0,
	    bottom: 0,
	    left: 0,
	    justifyContent: 'center',
	    alignItems: 'center',
	    backgroundColor: 'rgba(0, 0, 0, 0.2)'
	},
	modal_main:{
		flexDirection:'row',
		borderRadius:1,
		alignItems:'center',
		backgroundColor:'rgba(0, 0, 0, 0.75)',
		width:width*0.8,
		height:height*0.1,
	},
	uploading:{
		marginLeft:20,
		marginRight:20,
	},
	modal_text:{
		color:'#ccc'
	}
});