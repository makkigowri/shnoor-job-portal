import MainLayout from "../../layouts/MainLayout";
const LegalPage = ({ title, updatedOn, children }) => {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <h1 className="text-3xl font-bold text-heading">{title}</h1>
        <p className="text-sm text-body mt-2">Last updated: {updatedOn}</p>
        <div className="mt-8 space-y-5 text-body leading-relaxed text-sm">{children}</div>
      </div>
    </MainLayout>
  );
};
export default LegalPage;
