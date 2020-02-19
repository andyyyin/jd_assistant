/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {View, Text, Button} from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import HomeScreen from "./Screen/HomeScreen"
import DetailScreen from "./Screen/DetailScreen"
import LogScreen from "./Screen/LogScreen"


const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  Details: DetailScreen,
  Log: LogScreen,
});

export default createAppContainer(AppNavigator);
