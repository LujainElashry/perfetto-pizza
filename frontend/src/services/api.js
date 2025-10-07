import axios from "axios";

// Get API URL from environment variable or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/";
    }
    
    // Handle network errors
    if (!error.response) {
      console.error("Network error - Server may be down");
    }
    
    return Promise.reject(error);
  }
);

// ============================================
//              PIZZA API
// ============================================
export const pizzaAPI = {
  getAll: async () => {
    const response = await api.get("/pizzas");
    return response.data;
  },
  
  getPopular: async () => {
    const response = await api.get("/pizzas/popular");
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/pizzas/${id}`);
    return response.data;
  },
  
  create: async (formData) => {
    const response = await api.post("/pizzas/createPizza", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  
  update: async (id, formData) => {
    const response = await api.put(`/pizzas/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/pizzas/${id}`);
    return response.data;
  },
  
  updateQuantity: async (id, quantity) => {
    const response = await api.patch(`/pizzas/${id}/quantity`, { quantity });
    return response.data;
  },
};

// ============================================
//                USER API
// ============================================
export const userAPI = {
  register: async (userData) => {
    const response = await api.post("/users/register", userData);
    if (response.data.success) {
      sessionStorage.setItem("token", response.data.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/users/login", credentials);
    if (response.data.success) {
      sessionStorage.setItem("token", response.data.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    // Clear all cart data
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("cart_")) {
        sessionStorage.removeItem(key);
      }
    });
  },

  getCurrentUser: () => {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// ============================================
//               ADMIN API
// ============================================
export const adminAPI = {
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },
};

// ============================================
//               ORDER API
// ============================================
export const orderAPI = {
  create: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },
  
  getUserOrders: async () => {
    const response = await api.get("/orders/my-orders");
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },
  
  getAllOrders: async (params = {}) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

// ============================================
//               MESSAGE API
// ============================================
export const messageAPI = {
  createMessage: async (data) => {
    const response = await api.post("/messages", data);
    return response.data;
  },
  
  getMyMessages: async () => {
    const response = await api.get("/messages/my-messages");
    return response.data;
  },
  
  getMessageById: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },
  
  replyToMessage: async (id, message) => {
    const response = await api.post(`/messages/${id}/reply`, { message });
    return response.data;
  },
  
  getAllMessages: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get("/messages", { params });
    return response.data;
  },
  
  adminReply: async (id, message) => {
    const response = await api.post(`/messages/${id}/admin-reply`, { message });
    return response.data;
  },
  
  updateMessageStatus: async (id, status) => {
    const response = await api.patch(`/messages/${id}/status`, { status });
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await api.get("/messages/unread-count");
    return response.data;
  },
  
  getAdminUnreadCount: async () => {
    const response = await api.get("/messages/admin/unread-count");
    return response.data;
  },
};

export default api;