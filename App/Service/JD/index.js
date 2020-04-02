import api from './api';

const available = api.available

let _productMap = {};

const addProductId = async (id) => {
  return (_productMap = await api.addProductId(id))
}

const deleteProduct = async (id) => {
  return (_productMap = await api.deleteProduct(id))
}

const getProduct = (id) => _productMap[id]

const loadProducts = async () => {
  return (_productMap = await api.getProductMap())
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
