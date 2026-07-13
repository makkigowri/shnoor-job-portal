const benefits = [
  {
    title: "Career Growth",
    description:"Clear career progression through structured mentorship, regular performance reviews and leadership opportunities."
  },
  {
    title: "Continuous Learning",
    description: "Access certification programs, technical workshops and learning resources to enhance your skills."
  },
  {
    title: "Innovation",
    description: "Build next-generation AI, cloud and enterprise solutions using modern technologies with talented teams."
  },
  {
    title: "Work-Life Balance",
    description: "Flexible work culture, wellness initiatives and employee benefits designed for long-term success."
  }
];
const WhyJoinShnoor = () => {
  return (
    <section
  id="life-at-shnoor"
  className="bg-[#F8FAFC] pt-6 pb-16"
>
      <div className="max-w-[1400px] mx-auto px-10 lg:px-14">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="mt-5 text-5xl font-bold text-[#3E3A74]">
            Why Join SHNOOR
          </h2>
          <p className="mt-5 text-[17px] leading-8 text-[#111827]">
            Build your career with a company that encourages innovation,continuous learning and professional growth while creating world-class technology solutions.
          </p>
        </div>
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#7393D3] hover:shadow-xl"
            >
              <div className="mb-6 h-1 w-14 rounded-full bg-[#7393D3] group-hover:w-24 transition-all duration-300"></div>
              <h3 className="text-[24px] font-bold text-[#3E3A74]">
                {item.title}
              </h3>
              <p className="mt-4 leading-8 text-[#111827]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default WhyJoinShnoor;