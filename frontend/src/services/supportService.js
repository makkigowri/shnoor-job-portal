import api from "./api";
import adminApi from "./adminApi";
export const sendSupportMessage = async (message) => {

  const { data } = await api.post(
    "/support/message",
    {
      message,
    }
  );

  return data;

};

export const getMyConversation = async () => {

  const { data } = await api.get(
    "/support/conversation"
  );

  return data;

};

export const submitSupportFeedback = async (
  payload
) => {

  const { data } = await api.post(
    "/support/feedback",
    payload
  );

  return data;

};

export const getSupportConversations = async () => {

  const { data } = await adminApi.get(
    "/support/conversations"
  );

  return data;

};

export const getSupportConversation = async (
  conversationId
) => {

  const { data } = await adminApi.get(
    `/support/conversation/${conversationId}`
  );

  return data;

};

export const replySupportMessage = async (
  conversationId,
  message
) => {

  const { data } = await adminApi.post(
    "/support/reply",
    {
      conversationId,
      message,
    }
  );

  return data;

};
export const resolveSupportConversation = async (
  conversationId
) => {

  const { data } = await adminApi.post(
    "/support/resolve",
    {
      conversationId,
    }
  );

  return data;

};
export const getSupportAnalytics = async () => {

  const { data } = await adminApi.get(
    "/support/analytics"
  );

  return data;

};