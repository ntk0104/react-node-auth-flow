// axiosInstance.js

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // Thay thế bằng URL của máy chủ của bạn
});

// Interceptor để thêm token vào header của mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý refresh token và retry request nếu token hết hạn
let isRefreshing = false;
let failedRequests = [];

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("🚀 ~ file: axiosInstance.js:32 ~ error:", error)
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      console.log('Token expire')
      if (!isRefreshing) {
        console.log('Still not refresh. Start Refreshing...')
        isRefreshing = true;
        // Gửi yêu cầu refresh token
        return axiosInstance
          .post("/refreshToken", { refreshToken  })
          .then((response) => {
            console.log('Refresh token successfully...')
            const newAccessToken = response.data.accessToken;
            console.log("🚀 ~ file: axiosInstance.js:51 ~ .then ~ newAccessToken:", newAccessToken)
            localStorage.setItem("accessToken", newAccessToken);
            console.log("🚀 ~ file: axiosInstance.js:53 ~ .then ~ originalRequest BEFORE update header:", JSON.stringify(originalRequest.headers[
              "Authorization"
            ]))
            originalRequest.headers[
              "Authorization"
            ] = `${newAccessToken}`;
            console.log("🚀 ~ file: axiosInstance.js:53 ~ .then ~ originalRequest AFTER update header:", JSON.stringify(originalRequest.headers[
              "Authorization"
            ]))

            // Retry request đã thất bại
            console.log(`Retry failed requests. Number of failed request: ${failedRequests.length}`)
            console.log("🚀 ~ file: axiosInstance.js:61 ~ .then ~ failedRequests:", failedRequests)
            failedRequests.forEach((req) => req.resolve(newAccessToken));
            failedRequests = [];
            return axiosInstance(originalRequest);
          })
          .catch((error) => {
            // Xử lý lỗi khi refresh token thất bại
            return Promise.reject(error);
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        console.log('Triggered Processing Refresh token, push this failed request to list failedRequest, please waiting for retry ...')
        // Đợi cho việc refresh token hoàn tất
        return new Promise((resolve) => {
          failedRequests.push({ resolve });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
