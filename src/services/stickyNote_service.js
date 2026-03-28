import api from '@/network/core/axiosInstance';

// Get all sticky notes for the authenticated user
export async function getStickyNotes() {
  try {
    const response = await api.get('/api/sticky-notes');
    return response.data;
  } catch (error) {
    console.error('Error fetching sticky notes:', error);
    throw error;
  }
}

// Create a new sticky note
export async function createStickyNote(noteData) {
  try {
    const response = await api.post('/api/sticky-notes', noteData);
    return response.data;
  } catch (error) {
    console.error('Error creating sticky note:', error);
    throw error;
  }
}

// Update a sticky note
export async function updateStickyNote(id, updates) {
  try {
    const response = await api.put(`/api/sticky-notes/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating sticky note:', error);
    throw error;
  }
}

// Delete a sticky note
export async function deleteStickyNote(id) {
  try {
    const response = await api.delete(`/api/sticky-notes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting sticky note:', error);
    throw error;
  }
}

// Bring sticky note to front
export async function bringToFront(id) {
  try {
    const response = await api.put(`/api/sticky-notes/${id}/bring-to-front`);
    return response.data;
  } catch (error) {
    console.error('Error bringing sticky note to front:', error);
    throw error;
  }
}
