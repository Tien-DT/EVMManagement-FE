import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const chatbotService = {
  sendMessage: async (message) => {
    try {
      const response = await axiosInstance.post(endpoints.chatbot.chat, {
        message: message,
      });
      return response.data || response;
    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      throw error;
    }
  },
};

export default chatbotService;
