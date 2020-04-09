import React from 'react';
import {Text, View, Image, TextInput} from "react-native"

const styles = {}

styles.container = {
  borderColor: '#bbb',
  borderWidth: 1,
  borderRadius: 3,
  flexDirection: 'row',
  alignItems: 'center',
  padding: 4
}

styles.input = {
  color: '#111',
  fontSize: 16,
  flex: 1,
}

export default ({onChange, style, placeholder}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={'#aaa'}
        style={styles.input}
      />
    </View>
  )
}