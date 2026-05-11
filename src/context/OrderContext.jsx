import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Order Context
const OrderContext = createContext();

// Order Actions
const ORDER_ACTIONS = {
  ADD_ORDER: 'ADD_ORDER',
  LOAD_ORDERS: 'LOAD_ORDERS',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS'
};

// Order Reducer
const orderReducer = (state, action) => {
  console.log('OrderReducer: Action received:', action.type, action.payload);
  
  switch (action.type) {
    case ORDER_ACTIONS.ADD_ORDER:
      const newState = {
        ...state,
        orders: [...state.orders, action.payload]
      };
      console.log('OrderReducer: New state after ADD_ORDER:', newState);
      return newState;
    
    case ORDER_ACTIONS.LOAD_ORDERS:
      return {
        ...state,
        orders: action.payload
      };
    

    
    default:
      return state;
  }
};

// Initial State
const initialState = {
  orders: []
};

// Order Provider Component
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Order Actions
  const addOrder = (orderData) => {
    console.log('OrderContext: Adding order with data:', orderData);
    
    const newOrder = {
      id: orderData.orderId,
      paymentId: orderData.paymentId,
      status: 'Processing',
      orderDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(), // Add createdAt for AdminDashboard
      estimatedDelivery: getEstimatedDelivery(),
      items: orderData.items,
      total: orderData.amount,
      amount: orderData.amount, 
      customerName: orderData.customerName || 'Guest Customer',

    };
    
    console.log('OrderContext: Created new order:', newOrder);
    dispatch({ type: ORDER_ACTIONS.ADD_ORDER, payload: newOrder });
    console.log('OrderContext: Order dispatched to reducer');
    
    return newOrder;
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from now
    return deliveryDate.toISOString().split('T')[0];
  };

  const getOrderById = (orderId) => {
    return state.orders.find(order => order.id === orderId);
  };

  const getAllOrders = () => {
    return state.orders;
  };



  const value = {
    orders: state.orders,
    addOrder,
    getOrderById,
    getAllOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom Hook to use Order Context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;