export const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const addToCart = (product, quantity) => {
  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.product.id === product.id);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  
  saveCart(cart);
  return cart;
};

export const updateCartItem = (productId, quantity) => {
  const cart = getCart();
  const index = cart.findIndex(item => item.product.id === productId);
  
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
  }
  
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem('cart');
};

export const getCartTotal = (cart) => {
  return cart.reduce((total, item) => {
    const price = item.product.price;
    const discount = item.product.discount || 0;
    const finalPrice = price - (price * discount / 100);
    return total + (finalPrice * item.quantity);
  }, 0);
};