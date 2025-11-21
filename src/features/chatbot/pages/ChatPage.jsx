import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Card, List, Avatar, Spin, message, Typography } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";
import chatbotService from "../services/chatbotService";
import { useAuth } from "../../../context/AuthContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý ảo của EVM Management. Tôi có thể giúp gì cho bạn?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(inputMessage);
      
      // API returns data.response containing the chatbot reply
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: response.response || response.message || "Xin lỗi, tôi không hiểu câu hỏi của bạn.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 p-6">
      {/* Header */}
      <Card
        className="mb-4 shadow-sm"
        bodyStyle={{ padding: "16px 24px" }}
      >
        <div className="flex items-center space-x-3">
          <Avatar
            size={48}
            icon={<RobotOutlined />}
            style={{ backgroundColor: "#52c41a" }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Trợ lý ảo EVM
            </Title>
            <Text type="secondary">Luôn sẵn sàng hỗ trợ bạn</Text>
          </div>
        </div>
      </Card>

      {/* Messages Container */}
      <Card
        className="flex-1 overflow-hidden shadow-sm"
        bodyStyle={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column",
          padding: 0 
        }}
      >
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ 
            maxHeight: "calc(100vh - 280px)",
            scrollbarWidth: "thin"
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar
                icon={msg.sender === "bot" ? <RobotOutlined /> : <UserOutlined />}
                style={{
                  backgroundColor: msg.sender === "bot" ? "#52c41a" : "#1890ff",
                }}
              />
              <div
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
                style={{ maxWidth: "70%" }}
              >
                <div
                  className={`px-4 py-3 rounded-lg ${
                    msg.sender === "bot"
                      ? "bg-white border border-gray-200"
                      : "bg-blue-500 text-white"
                  }`}
                  style={{
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Text
                    style={{
                      color: msg.sender === "user" ? "white" : "inherit",
                    }}
                  >
                    {msg.text}
                  </Text>
                </div>
                <Text
                  type="secondary"
                  style={{ fontSize: "11px", marginTop: "4px" }}
                >
                  {msg.timestamp.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <Avatar
                icon={<RobotOutlined />}
                style={{ backgroundColor: "#52c41a" }}
              />
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                <Spin size="small" />
                <Text style={{ marginLeft: 8 }}>Đang trả lời...</Text>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex space-x-2">
            <TextArea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={loading}
              disabled={!inputMessage.trim()}
              size="large"
            >
              Gửi
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
