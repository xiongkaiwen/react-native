import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput
} from 'react-native';
import ModalPicker from 'react-native-modal-picker'

export default class SampleApp extends Component {

    constructor(props) {
        super(props);

        this.state = {
            textInputValue: ''
        }
        // 构造数组
        this._data = this.props.data;
        this._initval = this.props.initValName;// 默认值
        
        this.doneChose = this.doneChose.bind(this);
    }
    componentDidMount(){
        if(this.props.initVal!=undefined){
            console.log('默认值',this._initval);
            this.setState({
                textInputValue:this._initval,
            });
            // 
            this.props.selected(this.props.initVal);
        }
    }
    doneChose(option){
      this.props.selected(option.key);
      this.setState({textInputValue:option.label})
    }
    
    render() {
        return (
            <View style={{flex:1, justifyContent:'space-around',marginBottom:5}}>
                <ModalPicker
                    cancelText={'关闭'}
                    data={this._data}
                    onChange={(option)=>{this.doneChose(option)}}>
                    
                    <TextInput
                        style={{padding:10, height:30,paddingLeft:0}}
                        editable={false}
                        placeholder="请选择"
                        value={this.state.textInputValue} />
                </ModalPicker>
            </View>
        );
    }
}