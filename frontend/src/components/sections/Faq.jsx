import { useState } from "react";
const faqs = [
  {
    question: "How can i apply for a job at SHNOOR?",
    answer:
      "Create an account, complete your profile, upload your resume, and apply directly through the SHNOOR Job Portal."
  },
  {
    question: "Can i apply for multiple positions?",
    answer:
      "Yes. You can apply for multiple positions that match your skills and experience."
  },
  {
    question: "How do i track my application status?",
    answer:
      "After logging in, visit the Applied Jobs section to view the latest status of your applications."
  },
  {
    question: "Will i receive interview notifications?",
    answer:
      "Yes. Interview schedules and recruitment updates will appear in your Notifications section and will also be sent to your registered email."
  },
  {
    question: "Can i update my profile and resume later?",
    answer:
      "Absolutely. You can update your personal information, skills and resume anytime from your Profile page."
  }
];
const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section className="py-24 bg-white" id="faq">
      <div className="max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#EEF2FF] text-[#3E3A74] px-5 py-2 rounded-full font-semibold mb-5">
            Frequently Asked Questions
          </span>
          <h2 className="text-5xl font-bold text-[#3E3A74]">
            Have Questions?
          </h2>
          <p className="text-black text-lg mt-5">
            Find answers to the most commonly asked questions about SHNOOR recruitment.
          </p>
        </div>
        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? -1 : index)
                }
                className="w-full flex justify-between items-center px-7 py-6 text-left"
              >
                <h3 className="text-xl font-semibold text-[#3E3A74]">
                  {faq.question}
                </h3>
                <span className="text-3xl text-[#7393D3]">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-7 pb-7">
                  <p className="text-black leading-8">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Faq;