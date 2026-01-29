// Handle Add to Cart buttons
console.log('[ADD-TO-CART.JS] ===== Script loaded =====');
console.log('[ADD-TO-CART.JS] Current URL:', window.location.href);

// Check immediately if cart.js is loaded (before DOMContentLoaded)
console.log('[ADD-TO-CART.JS] typeof addToCart:', typeof addToCart);
console.log('[ADD-TO-CART.JS] typeof getCart:', typeof getCart);

document.addEventListener('DOMContentLoaded', function() {
  console.log('[ADD-TO-CART.JS] ===== DOM Content Loaded =====');
  console.log('[ADD-TO-CART.JS] Page ready, document.readyState:', document.readyState);
  
  // Check if cart.js is loaded
  console.log('[ADD-TO-CART.JS] Checking cart.js functions:');
  console.log('[ADD-TO-CART.JS] - addToCart is', typeof addToCart);
  console.log('[ADD-TO-CART.JS] - getCart is', typeof getCart);
  console.log('[ADD-TO-CART.JS] - removeFromCart is', typeof removeFromCart);
  
  if (typeof addToCart === 'undefined') {
    console.error('[ADD-TO-CART.JS] ❌ FATAL: cart.js not loaded! addToCart function not found');
    return;
  }
  
  console.log('[ADD-TO-CART.JS] ✓ cart.js functions found!');
  
  // Use a more reliable selector approach
  const allLinks = document.querySelectorAll('a.btn');
  console.log('[ADD-TO-CART.JS] Found', allLinks.length, 'total a.btn elements');
  
  let cartButtonsFound = 0;
  allLinks.forEach((link, index) => {
    const text = link.textContent.toLowerCase().trim();
    console.log('[ADD-TO-CART.JS] Button ' + index + ':', text);
    
    if (text.includes('add to cart')) {
      cartButtonsFound++;
      console.log('[ADD-TO-CART.JS] ✓ Found Add to Cart button #' + cartButtonsFound);
      console.log('[ADD-TO-CART.JS] Button element:', link);
      console.log('[ADD-TO-CART.JS] Button href:', link.href);
      
      link.addEventListener('click', function(e) {
        console.log('[ADD-TO-CART.JS] ===== CLICK EVENT FIRED =====');
        console.log('[ADD-TO-CART.JS] Event object:', e);
        
        e.preventDefault();
        console.log('[ADD-TO-CART.JS] ✓ preventDefault() called');
        
        // Find the product info in the parent container
        const menuEntry = link.closest('.menu-entry');
        console.log('[ADD-TO-CART.JS] Looking for .menu-entry parent...');
        console.log('[ADD-TO-CART.JS] menuEntry found:', !!menuEntry);
        
        if (!menuEntry) {
          console.error('[ADD-TO-CART.JS] ❌ Could not find .menu-entry parent!');
          console.log('[ADD-TO-CART.JS] link.parentElement:', link.parentElement);
          console.log('[ADD-TO-CART.JS] link.parentElement.parentElement:', link.parentElement?.parentElement);
          console.log('[ADD-TO-CART.JS] link.parentElement.parentElement.parentElement:', link.parentElement?.parentElement?.parentElement);
          return;
        }
        
        console.log('[ADD-TO-CART.JS] ✓ Found menu-entry, extracting product details...');
        
        // Extract product details
        const titleElement = menuEntry.querySelector('h3 a') || menuEntry.querySelector('h3');
        const priceElement = menuEntry.querySelector('.price span');
        const imageElement = menuEntry.querySelector('.img');
        
        console.log('[ADD-TO-CART.JS] titleElement found:', !!titleElement);
        console.log('[ADD-TO-CART.JS] priceElement found:', !!priceElement);
        console.log('[ADD-TO-CART.JS] imageElement found:', !!imageElement);
        
        const title = titleElement?.textContent.trim() || 'Product';
        const priceText = priceElement?.textContent || '0';
        const price = parseFloat(priceText.replace('$', ''));
        const image = imageElement?.style.backgroundImage?.replace(/url\(["']?([^"']+)["']?\)/, '$1') || '';
        
        // Create a unique product ID based on title
        const productId = title.toLowerCase().replace(/\s+/g, '_');
        
        console.log('[ADD-TO-CART.JS] ✓ Extracted product details:', { title, price, image, productId });
        
        // Add to cart
        const product = {
          id: productId,
          name: title,
          price: price,
          image: image,
          quantity: 1
        };
        
        console.log('[ADD-TO-CART.JS] Calling addToCart() with product:', product);
        addToCart(product);
        console.log('[ADD-TO-CART.JS] ✓ addToCart() completed');
        console.log('[ADD-TO-CART.JS] Current cart:', getCart());
        
        // Show feedback
        link.textContent = 'Added!';
        link.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
          link.textContent = 'Add to Cart';
          link.style.backgroundColor = '';
        }, 1500);
        
        // Optional: Show toast/alert
        showAddedToast(title);
      });
    }
  });
  
  console.log('[ADD-TO-CART.JS] ===== Initialization complete =====');
  console.log('[ADD-TO-CART.JS] Total Add to Cart buttons found:', cartButtonsFound);
});

// Show toast notification when item is added
function showAddedToast(productName) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = `${productName} added to cart!`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    z-index: 9999;
    animation: slideIn 0.3s ease-in;
    font-family: Arial, sans-serif;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Add CSS animation if not present
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
