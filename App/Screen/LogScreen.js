import React from 'react';
import {Text, View, Image, SafeAreaView, ScrollView} from "react-native"
import {loadLocalLog} from "../Service/localLog"

const styles = {}

const parseTime = (time) => {
  let date = new Date(time)
  let month = date.getMonth() + 1 + ''
  if (month.length < 2) month = '0' + month
  let day = date.getDate() + ''
  if (day.length < 2) day = '0' + day
  let hour = date.getHours()
  let minutes = date.getMinutes()
  let second = date.getSeconds()
  return `${month}${day} ${hour}:${minutes}:${second}`
}

export default class LogScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
    }
  }

  componentDidMount(): void {
    loadLocalLog().then(data => {
      this.setState({data})
    })
  }

  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          {this.state.data &&
            <View>
              {this.state.data.map(one => (
                <View key={one.time} style={{flexDirection: 'row'}}>
                  <View style={{width: 105}}>
                    <Text>{parseTime(one.time)}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text>{one.log}</Text>
                  </View>
                </View>
              ))}
            </View>
          }
        </ScrollView>
      </SafeAreaView>
    );
  }
}
