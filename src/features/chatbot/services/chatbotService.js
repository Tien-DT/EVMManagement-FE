import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const chatbotService = {
  sendMessage: async (message) => {
    try {
      const response = await axiosInstance.post(endpoints.chatbot.chat, {
        message: message,
      });
      // API returns: { success: true, data: { response: "...", timestamp: "..." } }
      // axiosInstance already unwraps to response.data, so we get data.data
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      throw error;
    }
  },
};

export default chatbotService;
