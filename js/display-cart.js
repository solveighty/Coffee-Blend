// Display cart items in cart.html
console.log('[DISPLAY-CART.JS] Script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[DISPLAY-CART.JS] Initializing cart display');
  
  renderCart();
  
  // Listen for cart updates
  window.addEventListener('cartUpdated', function() {
    console.log('[DISPLAY-CART.JS] Cart updated event received');
    renderCart();
  });
});

function renderCart() {
  console.log('[DISPLAY-CART.JS] Rendering cart');
  
  const cart = getCart();
  const cartTableBody = document.querySelector('tbody') || document.querySelector('.cart-items-container');
  
  if (!cartTableBody) {
    console.log('[DISPLAY-CART.JS] Cart container not found');
    return;
  }
  
  // Clear existing rows
  cartTableBody.innerHTML = '';
  
  if (cart.length === 0) {
    console.log('[DISPLAY-CART.JS] Cart is empty');
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="5" style="text-align: center; padding: 20px;">Your cart is empty</td>';
    cartTableBody.appendChild(emptyRow);
    updateCartTotal(0);
    return;
  }
  
  console.log('[DISPLAY-CART.JS] Rendering', cart.length, 'items');
  
  let totalPrice = 0;
  
  cart.forEach((item, index) => {
    console.log('[DISPLAY-CART.JS] Adding item to cart:', item);
    
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <span class="remove-item" data-product-id="${item.id}" style="cursor: pointer; color: red; font-weight: bold;">×</span>
      </td>
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <input type="number" class="quantity-input" data-product-id="${item.id}" value="${item.quantity}" min="1" style="width: 60px;">
      </td>
      <td>$${itemTotal.toFixed(2)}</td>
    `;
    
    cartTableBody.appendChild(row);
  });
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.getAttribute('data-product-id');
      console.log('[DISPLAY-CART.JS] Removing product:', productId);
      removeFromCart(productId);
      renderCart();
    });
  });
  
  // Add event listeners to quantity inputs
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function(e) {
      const productId = this.getAttribute('data-product-id');
      const quantity = parseInt(this.value) || 1;
      console.log('[DISPLAY-CART.JS] Updating quantity for', productId, 'to', quantity);
      
      if (quantity < 1) {
        removeFromCart(productId);
      } else {
        updateCartQuantity(productId, quantity);
      }
      renderCart();
    });
  });
  
  updateCartTotal(totalPrice);
}

function updateCartTotal(total) {
  console.log('[DISPLAY-CART.JS] Updating total to:', total);
  
  // Find the total element and update it
  const totalElements = document.querySelectorAll('[class*="total"]');
  
  totalElements.forEach(el => {
    if (el.textContent.includes('$') || el.textContent.includes('Total')) {
      console.log('[DISPLAY-CART.JS] Found total element:', el);
      // Try to find the price span
      const priceSpan = el.querySelector('span');
      if (priceSpan) {
        priceSpan.textContent = '$' + total.toFixed(2);
      } else if (el.tagName === 'SPAN' || el.tagName === 'P') {
        // If it's a span or p, just update the text
        const text = el.textContent;
        if (text.includes('$')) {
          el.textContent = text.replace(/\$[\d.]+/, '$' + total.toFixed(2));
        }
      }
    }
  });
  
  // Also update the price span in the total-price div
  const totalPriceDiv = document.querySelector('.total-price span:last-child');
  if (totalPriceDiv) {
    totalPriceDiv.textContent = '$' + total.toFixed(2);
  }
}
