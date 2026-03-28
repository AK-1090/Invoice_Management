import axios from "axios";

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://invoice-backend-2-lnp0.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// -------------------------
// 🚀 Request Interceptor
// -------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      // Attach token
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🔄 API ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// -------------------------
// 🎉 Response Interceptor
// -------------------------
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });

    return response.data; // Always return ONLY the data
  },

  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data,
    });

    // Server Offline
    if (error.code === "ECONNREFUSED") {
      return Promise.reject(
        new Error(
          "Cannot connect to the server. Make sure backend is running on http://localhost:5000"
        )
      );
    }

    // Server returned an error
    if (error.response) {
      const message =
        error.response.data?.msg ||
        error.response.data?.message ||
        `Server error (${error.response.status})`;

      return Promise.reject(new Error(message));
    }

    // No response
    if (error.request) {
      return Promise.reject(
        new Error("No response from server. Check your network connection.")
      );
    }

    // Other Axios errors
    return Promise.reject(new Error("Unexpected request error"));
  }
);

export default api;
