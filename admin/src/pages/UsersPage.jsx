const MOCK_USERS = [
    { id: 1, name: "Michael Scott", email: "michael@dundermifflin.com", role: "Organizer" },
    { id: 2, name: "Pam Beesly", email: "pam@dundermifflin.com", role: "Organizer" },
    { id: 3, name: "Super Admin", email: "admin@reserveo.io", role: "Super Admin" },
  ];
  
  function UsersPage() {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
            <p className="text-sm text-base-content/70">Gestion des organisateurs et admins.</p>
          </div>
          <button className="btn btn-primary btn-sm self-start md:self-auto">
            + Invite user
          </button>
        </div>
  
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-outline badge-sm">{u.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  
  export default UsersPage;