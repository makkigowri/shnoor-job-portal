import api from "./api";
export const submitContactRequest = async (mobileNumber) => {
  const { data } = await api.post("/contact-requests", { mobileNumber });
  return data;
};
