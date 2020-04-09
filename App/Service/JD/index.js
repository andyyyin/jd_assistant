import api from './api';

const available = api.available

let _productList = [];

const addProductId = async (id) => {
  return (_productList = await api.addProductId(id))
}

const deleteProduct = async (id) => {
  return (_productList = await api.deleteProduct(id))
}

const getProduct = (id) => {
  return _productList.find(p => p.id === id)
}

const loadProducts = async () => {
  return (_productList = await api.getProductList())
}

const loadHistory = (id) => {
  return api.loadHistory(id)
}

export default {
  addProductId,
  deleteProduct,
  getProduct,
  loadProducts,
  loadHistory,
  available,
};
