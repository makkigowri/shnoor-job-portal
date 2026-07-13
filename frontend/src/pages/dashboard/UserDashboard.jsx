import DashboardShell from "../../layouts/DashboardShell";
import useAuth from "../../hooks/useAuth";
const UserDashboard = () => {
  const { user } = useAuth();
  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold text-heading">Welcome, {user?.fullname}</h1>
      <p className="text-body mt-2">
        Your job seeker dashboard. Job search, applications, and profile tools arrive in Phase 2.
      </p>
      <div className="card p-6 mt-8">
        <h2 className="font-semibold text-heading mb-2">Account Overview</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
          <div>
            <dt className="text-body">Full Name</dt>
            <dd className="text-heading font-medium mt-0.5">{user?.fullname}</dd>
          </div>
          <div>
            <dt className="text-body">Email</dt>
            <dd className="text-heading font-medium mt-0.5">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-body">Phone</dt>
            <dd className="text-heading font-medium mt-0.5">{user?.phone}</dd>
          </div>
          <div>
            <dt className="text-body">Role</dt>
            <dd className="text-heading font-medium mt-0.5 capitalize">{user?.role}</dd>
          </div>
        </dl>
      </div>
    </DashboardShell>
  );
};
export default UserDashboard;
