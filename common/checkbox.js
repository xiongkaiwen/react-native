import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableHighlight
} from "react-native"

import Icon from 'react-native-vector-icons/FontAwesome';

 
export default class CheckBox extends React.Component{
   static defaultProps = {
       label: 'Label',
      labelBefore: false,
      checked: false
    }; 
  static propTypes={
    label: React.PropTypes.string,
    labelStyle: React.PropTypes.object,
    checked: React.PropTypes.bool,
    onChange: React.PropTypes.func
  };
   constructor(props){
        super(props);
        //console.log(props);
        this.state = {
            checked: props.checked,
        };
    }
    componentWillMount(){
        //console.log("checkbox初始化啦");
    }
    componentWillReceiveProps(nextProps) {
      //console.log("checkbox接收到新参数啦 ");
      this.setState({
        checked: nextProps.checked
      });
    }
    componentWillUnmount(){
      //console.log("checkbox组件被销毁了");
    }
  
  onChange(status) {
     typeof(status)!="undefined"?this.setState({checked:status}):this.setState({checked:!this.state.checked});
     
  }
  toggle(){
    //console.log("checkbox被点击了");
    this.setState({checked:!this.state.checked});
    this.props.onChange(this.state.checked);   
  }
  render() {
    /*var source = "circle-o";

    if(this.state.checked){
      source = "check-circle-o";
    }*/
    let checkImg = <Image source={require('./../img/btn_select_n.png')} style={styles.checkbox} />
    if(this.state.checked){
      checkImg = <Image source={require('./../img/btn_select_s.png')} style={styles.checkbox} />
    }
     
    var container = (
      <View style={styles.container}>
        {/*<Icon name={source} size={this.props.size} style={styles.checkbox} color="red" ></Icon>*/}
        {checkImg}
        <View style={styles.labelContainer}>
          <Text style={[styles.label, this.props.labelStyle]}>{this.props.label}</Text>
        </View>
      </View>
    );

    if (this.props.labelBefore) {
      container = (
        <View style={styles.container}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, this.props.labelStyle]}>{this.props.label}</Text>
          </View>
          {/*<Icon name={source} size={this.props.size} style={styles.checkbox} color="red" ></Icon>*/}
          {checkImg}
        </View>
      );
    }

    return (
      <TouchableHighlight ref="checkbox" onPress={this.toggle.bind(this)} underlayColor='white'>
        {container}
      </TouchableHighlight>
    )
  }
};

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    width: 19,
    height: 19,
  },
  labelContainer: {
    marginLeft: 10,
    marginRight: 10
  },
  label: {
    fontSize: 15,
    lineHeight: 15,
    color: 'grey',
  }
});