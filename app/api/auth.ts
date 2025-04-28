import axios, { type AxiosError } from "axios"

const API_URL = "http://localhost:8000/api/auth/"

interface AuthError {
  error: string
}

interface AuthResponse {
  success: string
} 

export const register = async (username: string, email: string, password: string, confirm_password: string): Promise<AuthResponse> => {
  try {
    console.log(`Sending registration request to: ${API_URL}register/`);
    console.log({ username, email, password, confirm_password });

    const response = await axios.post(`${API_URL}register/`, { 
      username, 
      email, 
      password, 
      confirm_password 
    });

    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
        throw error.response.data;
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw { error: "No response received from the server. Please check if the server is running and accessible." };
      } else {
        console.error("Error setting up request:", error.message);
        throw { error: "Error setting up the request. Please check your network connection." };
      }
    }
    throw { error: "An unexpected error occurred. Please try again." };
  }
}


export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}login/`, { username, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Login failed");
    }
    throw new Error("An unexpected error occurred during login");
  }
};

