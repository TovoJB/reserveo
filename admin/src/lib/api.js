import axiosInstance from "./axios";

export const reservationApi = {
  getAll: async (filters = {}) => {
    const { data } = await axiosInstance.get("/reservations", { params: filters });
    return data;
  },

  getById: async (id) => {
    const { data } = await axiosInstance.get(`/reservations/${id}`);
    return data;
  },

  create: async (reservationData) => {
    const { data } = await axiosInstance.post("/reservations", reservationData);
    return data;
  },

  update: async ({ id, ...reservationData }) => {
    const { data } = await axiosInstance.put(`/reservations/${id}`, reservationData);
    return data;
  },

  updateStatus: async ({ id, status }) => {
    const { data } = await axiosInstance.patch(`/reservations/${id}/status`, { status });
    return data;
  },

  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/reservations/${id}`);
    return data;
  },
};

export const clientApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/clients");
    return data;
  },

  getById: async (id) => {
    const { data } = await axiosInstance.get(`/clients/${id}`);
    return data;
  },

  update: async ({ id, ...clientData }) => {
    const { data } = await axiosInstance.put(`/clients/${id}`, clientData);
    return data;
  },

  updateStatus: async ({ id, status }) => {
    const { data } = await axiosInstance.patch(`/clients/${id}/status`, { status });
    return data;
  },

  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/clients/${id}`);
    return data;
  },
};

export const spaceApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/spaces");
    return data;
  },
};

export const statsApi = {
  getDashboard: async () => {
    // This might need a specific endpoint in the backend
    // For now, we'll try to get it from a general stats route if it exists
    const { data } = await axiosInstance.get("/configuration"); // Place-holder or check if exists
    return data;
  },
};
