import { getAccessToken } from '../utils/authToken';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const baseUrl = import.meta.env.DEV
    ? '/api/v1'
    : (import.meta.env.VITE_BASE_API || '/api/v1');

  const token = getAccessToken();

  try {
    const response = await fetch(`${baseUrl}/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

