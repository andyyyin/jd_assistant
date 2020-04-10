import React from 'react';
import {
  StatusBar, Text, View, Image, AppState, ScrollView, RefreshControl, Button,
  KeyboardAvoidingView, SafeAreaView, Alert, TouchableWithoutFeedback, Clipboard
} from "react-native"
import { SwipeListView } from 'react-native-swipe-list-view'
import jdRemote from "../Service/JD"
import jdLocal from "../Service/JD_Local"
import JDTask from '../Service/JD/task'
import {checkClipboardForPid} from "./Function"
import {Ticket, GInput, GButton} from "./Widget"
import GlobalStyle from '../Style'
import api from '../Service/Api';

const jd = jdRemote.available ? jdRemote : jdLocal

const styles = {...GlobalStyle}
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
styles.preAddBack = {
  position: 'absolute',
  top: 12,
  left: 12,
  width: styles.screen.width - 90,
  height: 26,
  backgroundColor: '#fff',
}
styles.preAddText = {
  color: 'green',
  fontSize: 12,
  lineHeight: 13,
  width: styles.screen.width - 120,
  height: 26,
}
styles.preAddCancel = {
  width: 30,
  height: 26,
  alignItems: 'center',
  justifyContent: 'center',
}

export default class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      idInput: null,
      products: null,
      loading: false,
      testData: null,
      preAddName: null,
    }
    this.load().then()
    this.checkClipboard()
  }

  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "清单",
    headerRight: () => (
      <TouchableWithoutFeedback onPress={()=>{navigation.navigate('Setting')}}>
        <View style={{paddingHorizontal: 15, paddingVertical: 12}}>
          <Image source={require('../Image/setting.png')}/>
        </View>
      </TouchableWithoutFeedback>
    )
  })

  componentDidMount(): void {
    JDTask.init().then()
    AppState.addEventListener('change', this._handleAppStateChange);
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  load = async () => {
    const productList = await jd.loadProducts()
    if (productList) {
      this.setProductFromList(productList)
    } else {
      this.setState({products: []})
    }
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') this.checkClipboard()
  }

  checkClipboard = () => {
    checkClipboardForPid().then(pid => {
      if (!pid) return
      this.setState({idInput: pid}, () => {
        this.pidCheck().then()
      })
    })
  }

  refresh = () => {
    this.setState({loading: true}, () => {
      this.load().then(() => {
        this.setState({loading: false})
      })
    })
  }

  setProductFromList = (productList) => {
    console.log(productList)
    const products = productList
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
    jd.deleteProduct(id).then(this.setProductFromList)
  }

  idSubmit = (idInput) => this.setState({idInput})

  pidCheck = async () => {
    const pid = this.state.idInput
    const product = await api.getProduct2(pid)
    if (!product || !product[pid]) return
    this.setState({preAddName: product[pid].name})
  }

  clearInput = () => {
    this.setState({
      preAddName: null,
      idInput: null,
    })
  }

  addProduct = async () => {
    const {idInput} = this.state
    if (!idInput || isNaN(idInput)) {
      alert('请先输入商品ID')
      return
    }
    this.setState({loading: true})
    await jd.addProductId(idInput).then(this.setProductFromList)
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
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={this.refresh}
                />
              }
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
                          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {product.tickets.map((t, index) => (
                              <View style={{marginRight: 5, marginTop: 2}} key={product.id + 't' + index}>
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

            <View style={{flexDirection: 'row', padding: 10, position: 'relative'}}>
              <GInput style={{flex: 1}} onChange={this.idSubmit} placeholder={'在此输入商品ID'}/>
              <GButton title={'添加'} onPress={this.addProduct} style={{marginLeft: 10}}/>
              {this.state.preAddName &&
                <View style={styles.preAddBack}>
                  <Text style={styles.preAddText} numberOfLines={2} ellipsizeMode={'tail'}>
                    {this.state.preAddName}
                  </Text>
                  <View style={{position: 'absolute', top: 0, right: 0,}}>
                    <TouchableWithoutFeedback onPress={this.clearInput}>
                      <View style={styles.preAddCancel}>
                        <Image source={require('../Image/cancel.png')} style={{width: 16, height: 16, opacity: 0.5}}/>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              }
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
