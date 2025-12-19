const MOCK_BOOKINGS = [
    {
      id: "BK-0245",
      user: "Jim Halpert",
      space: "Desk 3",
      area: "Sample Floor",
      from: "19/12/2025 14:00",
      to: "19/12/2025 17:00",
      status: "confirmed",
    },
    {
      id: "BK-0244",
      user: "Michael Scott",
      space: "Conference 1",
      area: "Sample Floor",
      from: "19/12/2025 10:00",
      to: "19/12/2025 12:00",
      status: "checked-in",
    },
  ];
  
  function BookingsPage() {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Bookings</h2>
            <p className="text-sm text-base-content/70">
              Vue d’ensemble des réservations à venir et passées.
            </p>
          </div>
          <button className="btn btn-outline btn-sm self-start md:self-auto">
            Export CSV
          </button>
        </div>
  
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Space</th>
                  <th>Area</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BOOKINGS.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.user}</td>
                    <td>{b.space}</td>
                    <td>{b.area}</td>
                    <td>{b.from}</td>
                    <td>{b.to}</td>
                    <td>
                      <span className="badge badge-ghost badge-sm">{b.status}</span>
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
  
  export default BookingsPage;