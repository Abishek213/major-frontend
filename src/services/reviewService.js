import api from "@/utils/api";

export const submitReview = async ({ eventId, rating, comment }) => {
  const response = await api.post("/reviews", { eventId, rating, comment });
  return response.data;
};

export const getEventReviews = async (
  eventId,
  { page = 1, limit = 10 } = {}
) => {
  const response = await api.safeGet(`/reviews/event/${eventId}`, {
    params: { page, limit },
  });
  return response;
};

export const getUserReviews = async () => {
  const response = await api.safeGet("/reviews/user");
  return response;
};
