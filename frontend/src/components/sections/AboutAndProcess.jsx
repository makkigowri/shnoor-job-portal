const steps = [
  {
    step: "01",
    title: "Apply Online",
    description:
      "Submit your application through the SHNOOR Job Portal with your latest resume and profile."
  },
  {
    step: "02",
    title: "Profile Screening",
    description:
      "Our recruitment team evaluates your skills, experience and overall profile."
  },
  {
    step: "03",
    title: "Technical Interview",
    description:
      "Qualified candidates participate in technical and HR interview rounds."
  },
  {
    step: "04",
    title: "Offer & Onboarding",
    description:
      "Selected candidates receive an offer and complete the onboarding process."
  }
];
const AboutAndProcess = () => {
  return (
    <section
      id="about"
      className="bg-[#F8FAFC] py-14"
    >
      <div className="max-w-[1400px] mx-auto px-10 lg:px-14">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="mt-5 text-5xl font-bold text-[#3E3A74]">
            Grow Your Career With SHNOOR
          </h2>
          <p className="mt-5 text-[17px] leading-8 text-[#111827]">
            Join a workplace that encourages innovation, continuous learning and professional growth while building modern enterprise technology solutions.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-10 shadow-sm">
            <h3 className="text-3xl font-bold text-[#3E3A74]">
              Why Work With SHNOOR?
            </h3>
            <p className="mt-6 leading-8 text-[#111827]">
              SHNOOR Technologies develops enterprise software, AI solutions, cloud platforms and digital transformation services for global businesses. Every opportunity on this portal belongs exclusively to SHNOOR Technologies.
            </p>
            <p className="mt-5 leading-8 text-[#111827]">
              We focus on innovation, collaboration, career growth and continuous learning, giving employees the opportunity to work on impactful real-world projects.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-5">
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6">
                <h4 className="text-4xl font-bold text-[#3E3A74]">
                  15+
                </h4>
                <p className="mt-2 text-[#111827]">
                  Years of Excellence
                </p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6">
                <h4 className="text-4xl font-bold text-[#3E3A74]">
                  500+
                </h4>
                <p className="mt-2 text-[#111827]">
                  Team Members
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-10 shadow-sm">
            <h3 className="text-3xl font-bold text-[#3E3A74] mb-8">
              Recruitment Process
            </h3>
            <div className="space-y-7">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-5"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7393D3] text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <div className="flex-1 border-b border-[#E5E7EB] pb-6 last:border-none last:pb-0">
                    <h4 className="text-2xl font-semibold text-[#3E3A74]">
                      {item.title}
                    </h4>
                    <p className="mt-2 leading-7 text-[#111827]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutAndProcess;