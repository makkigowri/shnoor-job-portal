import { useEffect, useState } from "react";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { getSupportAnalytics } from "../../services/supportService";

export default function SupportAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const loadAnalytics = async () => {
  try {
    const data = await getSupportAnalytics();

    console.log("Analytics API:", data);

    setAnalytics(data.analytics);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <p className="text-gray-500">
            Loading analytics...
          </p>
        </div>
      </AdminLayout>
    );
  }

  const summary = analytics?.summary || {};
  const ratings = analytics?.ratingDistribution || [];
  const feedback = analytics?.recentFeedback || [];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Support Analytics
          </h1>

          <p className="text-gray-500 mt-1">
            Support conversations and customer feedback
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">

          <div className="bg-white rounded-2xl shadow border p-5">
            <MessageCircle
              className="text-blue-500 mb-3"
              size={30}
            />

            <h2 className="text-sm text-gray-500">
              Total Requests
            </h2>

            <p className="text-3xl font-bold mt-2">
              {summary.total_tickets || 0}
            </p>
          </div>

          

          <div className="bg-white rounded-2xl shadow border p-5">
            <CheckCircle
              className="text-green-500 mb-3"
              size={30}
            />

            <h2 className="text-sm text-gray-500">
              Resolved 
            </h2>

            <p className="text-3xl font-bold mt-2">
              {summary.resolved_tickets || 0}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow border p-5">
            <Star
              className="text-yellow-500 mb-3"
              size={30}
            />

            <h2 className="text-sm text-gray-500">
              Average Rating
            </h2>

            <p className="text-3xl font-bold mt-2">
              {summary.average_rating || 0}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-5">
              Ratings
            </h2>

            <div className="space-y-4">

              {ratings.length === 0 ? (

                <p className="text-gray-500">
                  No ratings yet.
                </p>

              ) : (

                ratings.map((item) => (

                  <div
                    key={item.rating}
                    className="flex justify-between items-center"
                  >

                    <div className="flex items-center gap-2">

                      <Star
                        size={18}
                        className="text-yellow-400"
                        fill="currentColor"
                      />

                      <span>
                        {item.rating} Star
                      </span>

                    </div>

                    <span className="font-semibold">
                      {item.total}
                    </span>

                  </div>

                ))

              )}

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-5">
              Recent Feedback
            </h2>

            <div className="space-y-4">

              {feedback.length === 0 ? (

                <p className="text-gray-500">
                  No feedback available.
                </p>

              ) : (

                feedback.map((item) => (

                  <div
                    key={item.id}
                    className="border rounded-xl p-4"
                  >

                    <div className="flex justify-between">

                      <div>

                        <p className="font-semibold">
                          {item.fullname}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.email}
                        </p>

                      </div>

                      <div className="flex items-center gap-1">

                        <Star
                          size={16}
                          fill="currentColor"
                          className="text-yellow-400"
                        />

                        <span>
                          {item.rating}
                        </span>

                      </div>

                    </div>

                    <p className="mt-3 text-gray-700">
                      {item.comments || "No comments"}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}