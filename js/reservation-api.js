// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to create a reservation
async function createReservation(reservationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}

// Helper function to get all reservations
async function getAllReservations() {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
}

// Helper function to get a single reservation
async function getReservation(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reservation:', error);
    throw error;
  }
}

// Helper function to delete a reservation
async function deleteReservation(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createReservation,
    getAllReservations,
    getReservation,
    deleteReservation,
  };
}
