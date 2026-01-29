// Handle checkout form submission
console.log('[CHECKOUT-FORM.JS] Script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[CHECKOUT-FORM.JS] DOMContentLoaded fired');
  
  const billingForm = document.querySelector('.billing-form');
  
  if (billingForm) {
    console.log('[CHECKOUT-FORM.JS] Found billing form');
    
    // Find or create submit button if it doesn't exist
    let submitBtn = billingForm.querySelector('input[type="submit"]');
    if (!submitBtn) {
      // If there's no submit button, create one
      submitBtn = document.createElement('input');
      submitBtn.type = 'submit';
      submitBtn.value = 'Place an order';
      submitBtn.className = 'btn btn-primary py-3 px-4';
      
      // Find the last form-group and add the button after it
      const lastFormGroup = billingForm.querySelector('.form-group:last-of-type');
      if (lastFormGroup) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group mt-4';
        wrapper.appendChild(submitBtn);
        billingForm.appendChild(wrapper);
      }
    }
    
    billingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('[CHECKOUT-FORM.JS] Form submitted');

      // Get form values by finding inputs more reliably
      const allInputs = billingForm.querySelectorAll('input[type="text"]');
      const select = billingForm.querySelector('select');
      
      // Map inputs by their position in the form
      let inputIndex = 0;
      const firstName = allInputs[inputIndex++]?.value.trim() || '';
      const lastName = allInputs[inputIndex++]?.value.trim() || '';
      const country = select?.value || '';
      const streetAddress = allInputs[inputIndex++]?.value.trim() || '';
      const apartment = allInputs[inputIndex++]?.value.trim() || '';
      const city = allInputs[inputIndex++]?.value.trim() || '';
      const postcode = allInputs[inputIndex++]?.value.trim() || '';
      const phone = allInputs[inputIndex++]?.value.trim() || '';
      const email = allInputs[inputIndex++]?.value.trim() || '';

      console.log('[CHECKOUT-FORM.JS] Form values:', {
        firstName,
        lastName,
        country,
        streetAddress,
        apartment,
        city,
        postcode,
        phone,
        email
      });

      // Validate inputs
      if (!firstName) {
        showCheckoutAlert('Please enter your first name', 'error');
        return;
      }

      if (!lastName) {
        showCheckoutAlert('Please enter your last name', 'error');
        return;
      }

      if (!country) {
        showCheckoutAlert('Please select a country', 'error');
        return;
      }

      if (!streetAddress) {
        showCheckoutAlert('Please enter your street address', 'error');
        return;
      }

      if (!city) {
        showCheckoutAlert('Please enter your city', 'error');
        return;
      }

      if (!postcode) {
        showCheckoutAlert('Please enter your postcode/ZIP', 'error');
        return;
      }

      if (!phone) {
        showCheckoutAlert('Please enter your phone number', 'error');
        return;
      }

      if (!email || !email.includes('@')) {
        showCheckoutAlert('Please enter a valid email address', 'error');
        return;
      }

      console.log('[CHECKOUT-FORM.JS] All validation passed');

      // Get cart total (you may need to adjust this selector based on your HTML)
      const cartTotalElement = document.querySelector('.cart-total .d-flex:last-of-type span:last-of-type');
      const totalAmount = parseFloat(cartTotalElement?.textContent.replace('$', '') || '0');

      // Get payment method
      const paymentMethod = document.querySelector('input[name="optradio"]:checked')?.parentElement?.textContent.trim() || 'Direct Bank Transfer';

      const orderData = {
        firstName,
        lastName,
        country,
        streetAddress,
        apartment: apartment || null,
        city,
        postcode,
        phone,
        email,
        totalAmount,
        paymentMethod
      };

      console.log('[CHECKOUT-FORM.JS] Order data:', orderData);

      // Show loading state
      const originalValue = submitBtn.value;
      submitBtn.value = 'Processing...';
      submitBtn.disabled = true;

      try {
        console.log('[CHECKOUT-FORM.JS] Calling createOrder API');
        const response = await createOrder(orderData);

        console.log('[CHECKOUT-FORM.JS] API response:', response);

        if (response.success) {
          console.log('[CHECKOUT-FORM.JS] Order created successfully');
          showCheckoutAlert('Order placed successfully! Thank you for your purchase.', 'success');
          
          // Clear form
          billingForm.reset();
          
          // Redirect to a success page after 2 seconds
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 2000);
        } else {
          console.log('[CHECKOUT-FORM.JS] API error:', response.message);
          showCheckoutAlert(response.message || 'Error placing order', 'error');
        }
      } catch (error) {
        console.error('[CHECKOUT-FORM.JS] Catch error:', error);
        showCheckoutAlert('Error placing order. Please try again.', 'error');
      } finally {
        submitBtn.value = originalValue;
        submitBtn.disabled = false;
      }
    });
  } else {
    console.log('[CHECKOUT-FORM.JS] Billing form not found');
  }
});

// API function to create order
// Uses API_BASE_URL from config.js
async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Helper function to show alerts in checkout
function showCheckoutAlert(message, type = 'info') {
  // For immediate user feedback, use native alert
  if (type === 'success') {
    alert(message);
  } else if (type === 'error') {
    alert('ERROR: ' + message);
  }

  // Also try to show in the DOM
  const existingAlerts = document.querySelectorAll('.checkout-alert');
  existingAlerts.forEach(alert => alert.remove());

  const alertDiv = document.createElement('div');
  alertDiv.className = `checkout-alert alert alert-${type} alert-dismissible fade show`;
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  `;

  // Insert at the beginning of the form or page
  const form = document.querySelector('.billing-form');
  if (form) {
    form.insertBefore(alertDiv, form.firstChild);
  } else {
    document.body.insertBefore(alertDiv, document.body.firstChild);
  }

  // Auto-dismiss success alerts after 3 seconds
  if (type === 'success') {
    setTimeout(() => {
      const closeBtn = alertDiv.querySelector('.close');
      if (closeBtn) {
        closeBtn.click();
      }
    }, 3000);
  }
}
