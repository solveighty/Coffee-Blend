// Handle appointment form submission
console.log('[APPOINTMENT-FORM.JS] Script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[APPOINTMENT-FORM.JS] DOMContentLoaded fired');
  
  const appointmentForms = document.querySelectorAll('.appointment-form');
  console.log('[APPOINTMENT-FORM.JS] Found', appointmentForms.length, 'appointment forms');
  
  appointmentForms.forEach((appointmentForm, index) => {
    console.log('[APPOINTMENT-FORM.JS] Attaching event listener to form', index);
    
    appointmentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('[APPOINTMENT-FORM.JS] Form', index, 'submitted!');

      // Get form values
      const firstNameInput = appointmentForm.querySelector('input[placeholder="First Name"]');
      const lastNameInput = appointmentForm.querySelector('input[placeholder="Last Name"]');
      const dateInput = appointmentForm.querySelector('.appointment_date');
      const timeInput = appointmentForm.querySelector('.appointment_time');
      const phoneInput = appointmentForm.querySelector('input[placeholder="Phone"]');
      const messageInput = appointmentForm.querySelector('textarea');
      const submitBtn = appointmentForm.querySelector('input[type="submit"]');
      
      console.log('[APPOINTMENT-FORM.JS] Inputs found:', {
        firstName: !!firstNameInput,
        lastName: !!lastNameInput,
        date: !!dateInput,
        time: !!timeInput,
        phone: !!phoneInput,
        message: !!messageInput,
        submit: !!submitBtn
      });
      
      console.log('[APPOINTMENT-FORM.JS] Input values:', {
        firstName: firstNameInput?.value,
        lastName: lastNameInput?.value,
        date: dateInput?.value,
        time: timeInput?.value,
        phone: phoneInput?.value,
        message: messageInput?.value
      });

      // Validate inputs
      if (!firstNameInput || !firstNameInput.value.trim()) {
        console.log('[APPOINTMENT-FORM.JS] Validation failed: firstName empty');
        showAlert('Please enter your first name', 'error');
        return;
      }

      if (!lastNameInput || !lastNameInput.value.trim()) {
        console.log('[APPOINTMENT-FORM.JS] Validation failed: lastName empty');
        showAlert('Please enter your last name', 'error');
        return;
      }

      if (!dateInput || !dateInput.value.trim()) {
        console.log('[APPOINTMENT-FORM.JS] Validation failed: date empty');
        showAlert('Please select a date', 'error');
        return;
      }

      if (!timeInput || !timeInput.value.trim()) {
        console.log('[APPOINTMENT-FORM.JS] Validation failed: time empty');
        showAlert('Please select a time', 'error');
        return;
      }

      if (!phoneInput || !phoneInput.value.trim()) {
        console.log('[APPOINTMENT-FORM.JS] Validation failed: phone empty');
        showAlert('Please enter your phone number', 'error');
        return;
      }

      console.log('[APPOINTMENT-FORM.JS] All validation passed, preparing data');

      // Prepare data
      const reservationData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        date: formatDateForAPI(dateInput.value),
        time: timeInput.value.trim(),
        phone: phoneInput.value.trim(),
        message: messageInput.value.trim() || null,
      };

      console.log('[APPOINTMENT-FORM.JS] Reservation data:', reservationData);

      // Show loading state
      const originalValue = submitBtn.value;
      submitBtn.value = 'Sending...';
      submitBtn.disabled = true;

      try {
        console.log('[APPOINTMENT-FORM.JS] Calling createReservation API');
        // Call API
        const response = await createReservation(reservationData);

        console.log('[APPOINTMENT-FORM.JS] API response:', response);

        if (response.success) {
          console.log('[APPOINTMENT-FORM.JS] Success! Showing alert');
          showAlert('Reservation created successfully!', 'success');
          appointmentForm.reset();
          
          // Reset date and time pickers
          if (typeof jQuery !== 'undefined') {
            jQuery('.appointment_date').datepicker('setDate', null);
            jQuery('.appointment_time').timepicker('setTime', '');
          }
        } else {
          console.log('[APPOINTMENT-FORM.JS] API error:', response.message);
          showAlert(response.message || 'Error creating reservation', 'error');
        }
      } catch (error) {
        console.error('[APPOINTMENT-FORM.JS] Catch error:', error);
        showAlert('Error creating reservation. Please try again.', 'error');
      } finally {
        submitBtn.value = originalValue;
        submitBtn.disabled = false;
      }
    });
  });
});

// Helper function to format date for API (from datepicker format to YYYY-MM-DD)
function formatDateForAPI(dateString) {
  // The datepicker might return different formats depending on locale settings
  // This function handles common date formats
  
  if (!dateString) return '';

  // Try to parse the date
  let date = new Date(dateString);

  // If date is invalid, try parsing as DD/MM/YYYY or MM/DD/YYYY
  if (isNaN(date.getTime())) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      // Assume MM/DD/YYYY format from Bootstrap Datepicker
      date = new Date(parts[2], parts[0] - 1, parts[1]);
    }
  }

  if (isNaN(date.getTime())) {
    console.warn('Invalid date format:', dateString);
    return dateString;
  }

  // Format as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Helper function to show alerts
function showAlert(message, type = 'info') {
  // For immediate user feedback, use native alert for success and error
  if (type === 'success') {
    alert(message);
  } else if (type === 'error') {
    alert('ERROR: ' + message);
  }
  
  // Also try to show in the DOM
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll('.reservation-alert');
  existingAlerts.forEach(alert => alert.remove());

  // Create alert element
  const alertDiv = document.createElement('div');
  alertDiv.className = `reservation-alert alert alert-${type} alert-dismissible fade show`;
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  `;

  // Try multiple places to insert the alert
  let container = document.querySelector('.ftco-appointment');
  if (!container) {
    container = document.querySelector('.appointment');
  }
  if (!container) {
    container = document.querySelector('body');
  }
  
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);
  }

  // Auto-dismiss success alerts after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      const closeBtn = alertDiv.querySelector('.close');
      if (closeBtn) {
        closeBtn.click();
      }
    }, 5000);
  }
}

// Add Bootstrap alert styles if not already present
function ensureAlertStyles() {
  if (!document.getElementById('reservation-alert-styles')) {
    const style = document.createElement('style');
    style.id = 'reservation-alert-styles';
    style.innerHTML = `
      .reservation-alert {
        margin-bottom: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        border: 1px solid transparent;
      }
      
      .alert-success {
        color: #155724;
        background-color: #d4edda;
        border-color: #c3e6cb;
      }
      
      .alert-error {
        color: #721c24;
        background-color: #f8d7da;
        border-color: #f5c6cb;
      }
      
      .alert-info {
        color: #0c5460;
        background-color: #d1ecf1;
        border-color: #bee5eb;
      }
      
      .alert .close {
        position: relative;
        float: right;
        font-size: 21px;
        font-weight: 700;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        opacity: 0.5;
        cursor: pointer;
      }
      
      .alert .close:hover,
      .alert .close:focus {
        opacity: 0.75;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize alert styles
ensureAlertStyles();
