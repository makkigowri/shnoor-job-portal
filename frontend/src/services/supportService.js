import api from "./api";
export const sendSupportMessage = async (message) => {
  const { data } = await api.post("/support/message", { message });
  return data;
};
export const fetchMySupportConversation = async () => {
  const { data } = await api.get("/support/conversation");
  return data;
};
export const submitResolutionFeedback = async (conversationId, feedback) => {
  const { data } = await api.post("/support/resolution-feedback", {
    conversationId,
    feedback
  });
  return data;
};
