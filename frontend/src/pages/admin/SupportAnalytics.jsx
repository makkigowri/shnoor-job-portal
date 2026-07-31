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

    <div className="p-8 space-y-8">

      <div className="flex items-center justify-between rounded-3xl border border-gray-200 bg-gradient-to-r from-[#EEF1FB] via-white to-[#EEF1FB] px-8 py-7 shadow-sm">

        <div>

          <h1 className="text-3xl font-bold text-[#3E3A74]">
            Support Analytics
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor support conversations, customer satisfaction and feedback.
          </p>

        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7393D3] shadow-lg">

          <MessageCircle
            size={30}
            className="text-white"
          />

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Total Requests
              </p>

              <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">
                {summary.total_tickets || 0}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                All support tickets received
              </p>

            </div>

            <div className="rounded-2xl bg-[#EEF1FB] p-4 transition-all duration-300 group-hover:bg-[#7393D3]">

              <MessageCircle
                size={30}
                className="text-[#7393D3] group-hover:text-white"
              />

            </div>

          </div>

        </div>

        <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Resolved Tickets
              </p>

              <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">
                {summary.resolved_tickets || 0}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Successfully resolved issues
              </p>

            </div>

            <div className="rounded-2xl bg-green-50 p-4 transition-all duration-300 group-hover:bg-green-500">

              <CheckCircle
                size={30}
                className="text-green-400 group-hover:text-white"
              />

            </div>

          </div>

        </div>

        <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Average Rating
              </p>

              <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">
                {summary.average_rating || 0}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Customer satisfaction score
              </p>

            </div>

            <div className="rounded-2xl bg-yellow-50 p-4 transition-all duration-300 group-hover:bg-yellow-400">

              <Star
                size={30}
                fill="currentColor"
                className="text-yellow-500 group-hover:text-white"
              />

            </div>

          </div>

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">

  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm h-full">

    <div className="mb-6 flex items-center justify-between">

      <div>

        <h2 className="text-2xl font-bold text-[#3E3A74]">
          Rating Distribution
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Customer satisfaction breakdown
        </p>

      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FB]">

        <Star
          size={22}
          fill="currentColor"
          className="text-yellow-500"
        />

      </div>

    </div>

    <div className="space-y-6">

      {ratings.length === 0 ? (

        <div className="flex h-72 flex-col items-center justify-center">

          <div className="mb-5 h-16 w-16 rounded-2xl bg-[#EEF1FB]" />

          <h3 className="font-semibold text-[#3E3A74]">
            No Ratings Yet
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Ratings will appear here.
          </p>

        </div>

      ) : (

        ratings.map((item) => (

          <div key={item.rating}>

            <div className="mb-2 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Star
                  size={16}
                  fill="currentColor"
                  className="text-yellow-500"
                />

                <span className="font-medium text-gray-700">
                  {item.rating} Star
                </span>

              </div>

              <span className="font-bold text-[#3E3A74]">
                {item.total}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-[#7393D3]"
                style={{
                  width: `${Math.min(item.total * 20, 100)}%`,
                }}
              />

            </div>

          </div>

        ))

      )}

    </div>

  </div>

</div>

<div className="lg:col-span-8">

  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

    <div className="mb-6 flex items-center justify-between">

      <div>

        <h2 className="text-2xl font-bold text-[#3E3A74]">
          Recent Feedback
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Latest customer reviews
        </p>

      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FB]">

        <MessageCircle
          size={22}
          className="text-[#7393D3]"
        />

      </div>

    </div>

    <div className="space-y-5 max-h-[650px] overflow-y-auto pr-2">{feedback.length === 0 ? (

  <div className="flex h-72 flex-col items-center justify-center">

    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF1FB]">

      <MessageCircle
        size={28}
        className="text-[#7393D3]"
      />

    </div>

    <h3 className="text-lg font-semibold text-[#3E3A74]">
      No Feedback Available
    </h3>

    <p className="mt-2 text-sm text-gray-500">
      Customer feedback will appear here.
    </p>

  </div>

) : (

  feedback.map((item) => (

    <div
      key={item.id}
      className="rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-[#7393D3] hover:shadow-lg"
    >

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7393D3] text-lg font-bold text-white">

            {item.fullname
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}

          </div>

          <div>

            <h3 className="font-semibold text-[#3E3A74]">
              {item.fullname}
            </h3>

            <p className="text-sm text-gray-500">
              {item.email}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2">

          <Star
            size={16}
            fill="currentColor"
            className="text-yellow-500"
          />

          <span className="font-semibold text-[#3E3A74]">
            {item.rating}
          </span>

        </div>

      </div>

      <div className="mt-5 rounded-2xl bg-[#EEF1FB] p-5">

        <p className="leading-7 text-gray-700">
          {item.comments || "No comments"}
        </p>

      </div>

      <div className="mt-5 flex items-center justify-between">

        <span className="text-xs text-gray-400">
          {new Date(item.created_at).toLocaleString()}
        </span>

      </div>

    </div>

  ))

)}

    </div>

  </div>

</div>

</div>
</div>
</AdminLayout>

);
}