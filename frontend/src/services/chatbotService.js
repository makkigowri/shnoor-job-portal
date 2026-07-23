import api from "./api";
export const sendChatMessage = async (message) => {
  const { data } = await api.post("/chatbot/message", { message });
  return data;
};
