import adminApi from "./adminApi";
export const fetchSupportConversations = async () => {
  const { data } = await adminApi.get("/support/conversations");
  return data;
};
export const fetchSupportConversation = async (conversationId) => {
  const { data } = await adminApi.get(`/support/conversation/${conversationId}`);
  return data;
};
export const replyToSupportConversation = async (conversationId, message) => {
  const { data } = await adminApi.post("/support/reply", { conversationId, message });
  return data;
};
export const resolveSupportConversation = async (conversationId) => {
  const { data } = await adminApi.post("/support/resolve", { conversationId });
  return data;
};
export const fetchSupportAnalytics = async () => {
  const { data } = await adminApi.get("/support/analytics");
  return data;
};