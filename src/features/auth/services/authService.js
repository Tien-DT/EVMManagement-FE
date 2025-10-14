export const authService = {
  signup: async (data) => {
    console.log("Gọi API đăng ký:", data);
    // Giả lập API call
    return new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 1000)
    );
  },
};
