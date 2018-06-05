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
        this._data = [];
        this._initval = '';// 默认值
        for(let i in this.props.data){
            let item = this.props.data[i];
            this._data.push({
                key:item.catId,
                label:item.catName
            });
            if(this.props.initVal==item.catId){
                this._initval = item.catName;
            }
        }
        

        this.doneChose = this.doneChose.bind(this);
    }
    componentDidMount(){
        if(this.props.initVal!=undefined){

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
            <View style={{flex:1, justifyContent:'space-around',paddingLeft:10}}>
                <ModalPicker
                    cancelText={'关闭'}
                    data={this._data}
                    onChange={(option)=>{this.doneChose(option)}}>
                    
                    <TextInput
                        style={{padding:10, height:30,paddingLeft:0}}
                        editable={false}
                        placeholderTextColor={'#000'}
                        placeholder="主营"
                        value={this.state.textInputValue} />
                </ModalPicker>
            </View>
        );
    }
}