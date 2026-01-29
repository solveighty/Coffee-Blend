// Shopping Cart Management System
console.log('[CART.JS] ===== Script loaded =====');

const CART_STORAGE_KEY = 'coffee_blend_cart';
console.log('[CART.JS] Storage key:', CART_STORAGE_KEY);

// Initialize cart from localStorage
function getCart() {
  console.log('[CART.JS] getCart() called');
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  const result = cart ? JSON.parse(cart) : [];
  console.log('[CART.JS] getCart() returning:', result);
  return result;
}

// Save cart to localStorage
function saveCart(cart) {
  console.log('[CART.JS] saveCart() called with:', cart);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  console.log('[CART.JS] ✓ Cart saved to localStorage');
  // Trigger custom event so other scripts can react to cart changes
  const event = new CustomEvent('cartUpdated', { detail: cart });
  window.dispatchEvent(event);
  console.log('[CART.JS] ✓ cartUpdated event dispatched');
}

// Add product to cart
function addToCart(product) {
  console.log('[CART.JS] ===== addToCart() called =====');
  console.log('[CART.JS] Product parameter:', product);
  
  const cart = getCart();
  console.log('[CART.JS] Current cart state:', cart);
  
  const existingItem = cart.find(item => item.id === product.id);
  console.log('[CART.JS] Existing item found:', !!existingItem);
  
  if (existingItem) {
    console.log('[CART.JS] Incrementing quantity for existing product');
    existingItem.quantity += product.quantity || 1;
  } else {
    console.log('[CART.JS] Adding new product to cart');
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      quantity: product.quantity || 1
    });
  }
  
  saveCart(cart);
  console.log('[CART.JS] ✓ addToCart() completed');
  return cart;
}

// Remove product from cart
function removeFromCart(productId) {
  console.log('[CART.JS] removeFromCart() called with productId:', productId);
  
  let cart = getCart();
  console.log('[CART.JS] Cart before removal:', cart);
  cart = cart.filter(item => item.id !== productId);
  console.log('[CART.JS] Cart after removal:', cart);
  
  saveCart(cart);
  console.log('[CART.JS] Cart updated:', cart);
  return cart;
}

// Update product quantity
function updateCartQuantity(productId, quantity) {
  console.log('[CART.JS] Updating quantity:', productId, quantity);
  
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
    saveCart(cart);
  }
  
  console.log('[CART.JS] Cart updated:', cart);
  return cart;
}

// Clear entire cart
function clearCart() {
  console.log('[CART.JS] Clearing cart');
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
}

// Get cart total
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart badge in navigation
function updateCartBadge() {
  const count = getCartCount();
  const badge = document.querySelector('.cart-count-badge');
  
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Listen for cart updates and update badge
window.addEventListener('cartUpdated', updateCartBadge);

// Initialize badge on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    updateCartBadge
  };
}
