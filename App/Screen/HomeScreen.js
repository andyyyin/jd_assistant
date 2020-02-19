import React from 'react';
import {StatusBar, Text, View, Image, TouchableOpacity, ScrollView, Clipboard, Button,
  KeyboardAvoidingView, SafeAreaView, Alert, TouchableWithoutFeedback} from "react-native"
import { SwipeListView } from 'react-native-swipe-list-view'
import jd from "../Service/JD"
import JDTask from '../Service/JD/task'

import {Ticket, GInput, GButton} from "./Widget"

const styles = {}
styles.productContainer = {
  flexDirection: 'row',
  paddingTop: 4,
  paddingBottom: 4,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  paddingRight: 4,
}
styles.font = {
  fontSize: 12,
  lineHeight: 15,
}
styles.promFont = {
  ...styles.font,
  color: 'red'
}

export default class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      idInput: null,
      products: null,
      loading: false,
      testData: null,
    }
    this.load().then()
  }

  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Home",
    headerRight: () => <Button title="Log" onPress={()=>{ navigation.navigate('Log'); }} />,
  })

  componentDidMount(): void {
    JDTask.init().then()
  }

  load = async () => {
    const productMap = await jd.loadProducts()
    this.setProductFromMap(productMap)
  }

  setProductFromMap = (productMap) => {
    const products = Object.values(productMap)
    this.setState({products})
  }

  goDetail = ({id, isDown}) => {
    if (isDown) return
    console.log('go detail ' + id)
    this.props.navigation.navigate({
      routeName: 'Details',
      params: {
        id
      },
    })
  }
  tryDelete = (product) => {
    Alert.alert(
      `删除${product.id}？`,
      ``,
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {text: 'OK', onPress: () => this.deleteProduct(product)},
      ],
      { cancelable: false }
    )
  }

  deleteProduct = ({id}) => {
    jd.deleteProduct(id).then(this.setProductFromMap)
  }

  idSubmit = (idInput) => this.setState({idInput})

  addProduct = async () => {
    const {idInput} = this.state
    if (isNaN(idInput)) {
      // todo check fail
      return
    }
    this.setState({loading: true})
    await jd.addProductId(idInput).then(this.setProductFromMap)
    this.setState({loading: false})
  }

  render() {
    return this.state.products && !this.state.loading ?
      (
        <KeyboardAvoidingView
          behavior={'height'}
          style={{flex: 1}}
          keyboardVerticalOffset={85}
        >
          <StatusBar barStyle="dark-content"/>
          <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>

            <SwipeListView
              data={this.state.products}
              renderItem={ ({item: product}, rowMap) => (
                <TouchableWithoutFeedback
                  key={product.id}
                  onPress={() => this.goDetail(product)}
                >
                  <View style={{backgroundColor: '#fff'}}>
                    {product.name ?
                      <View style={[styles.productContainer, {opacity: product.isDown ? 0.3 : 1}]}>
                        <Image source={{uri: product.imgUrl}} style={{width: 90, height: 90}}/>
                        <View style={{fontSize: 12, flex: 1, marginLeft: 5}}>
                          <Text style={styles.font}>{product.name}</Text>
                          <View>

                          </View>
                          <View style={{flexDirection: 'row', overflow: 'hidden', flexWrap: 'nowrap'}}>
                            <Text style={styles.promFont}>
                              {product.promotions.reduce((r, p) => r + p.content + '。', '')}
                            </Text>
                            {/*{product.promotions.map((p, index) => (*/}
                            {/*  <View style={{marginRight: 10}} key={product.id + 'p' + index}>*/}
                            {/*    <Text style={{fontSize: 12, color: 'red'}}>{p.content}</Text>*/}
                            {/*  </View>*/}
                            {/*))}*/}
                          </View>
                          <View style={{flexDirection: 'row'}}>
                            {product.tickets.map((t, index) => (
                              <View style={{marginRight: 10}} key={product.id + 't' + index}>
                                <Ticket text={t.text} size={12}/>
                              </View>
                            ))}
                          </View>
                        </View>
                        {product.isDown ?
                          <View style={{marginLeft: 20}}>
                            <Text style={{fontSize: 20, color: '#000'}}>
                              下架
                            </Text>
                          </View>
                          :
                          <View style={{marginLeft: 5}}>
                            <Text style={{fontSize: 20, color: product.p_price ? 'green' : '#000'}}>
                              ¥{product.p_price || product.price}
                            </Text>
                            {product.promRank && product.promRank[0] &&
                            <Text style={{fontSize: 20, color: 'green'}}>
                              ¥{product.promRank[0].ratePrice}
                            </Text>
                            }
                          </View>
                        }
                      </View>
                      :
                      <View style={[styles.productContainer, {alignItem: 'center', justifyContent: 'center'}]}>
                        <Text style={{fontSize: 30}}>{product.id}</Text>
                      </View>
                    }
                  </View>
                </TouchableWithoutFeedback>
              )}
              renderHiddenItem={ ({item: product}, rowMap) => (
                <TouchableWithoutFeedback style={{height: '100%'}} onPress={()=>this.tryDelete(product)}>
                  <View style={{flexDirection: 'row', height: '100%'}}>
                    <View style={{flex: 1}}/>
                    <View style={{flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'red'}}>
                      <View style={{flex: 1}}/>
                      <View style={{width: 50, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontSize: 20, color: '#fff'}}>删除</Text>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )}
              rightOpenValue={-50}
            />

            <View style={{flexDirection: 'row', padding: 10}}>
              <GInput style={{flex: 1}} onChange={this.idSubmit}/>
              <GButton title={'+'} onPress={this.addProduct} style={{marginLeft: 10}}/>
            </View>
          </SafeAreaView>

        </KeyboardAvoidingView>
      ) : (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {/*<Text>Home Screen</Text>*/}
          {/*<Button*/}
          {/*  title={'go'}*/}
          {/*  onPress={() => this.props.navigation.navigate('Details')}*/}
          {/*/>*/}
          {/*<Button*/}
          {/*  title={'test jd'}*/}
          {/*  onPress={() => {*/}
          {/*    console.log('start test')*/}
          {/*    jd.getProduct(1284887).then(product => {*/}
          {/*      console.log(product)*/}
          {/*    });*/}
          {/*  }}*/}
          {/*/>*/}
          <Text style={{fontSize: 20}}>Loading...</Text>
        </View>
      )
  }
}
