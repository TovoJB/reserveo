import floorplan from "/floorplan.jpg";

const MOCK_AREAS = [
  {
    id: "area-1",
    name: "Olona_cooworking1",
    enabled: true,
    mapSize: "2047 x 802",
    spaces: [
      { id: "desk-1", label: "Desk 1", x: 23, y: 24 },
      { id: "desk-2", label: "Desk 2", x: 47, y: 56 },
      { id: "conf-1", label: "Conference 1", x: 63, y: 20 },
      { id: "desk-3", label: "Desk 3", x: 21, y: 63 },
    ],
  },
];

function AreasPage() {
  const selectedArea = MOCK_AREAS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Areas</h2>
          <p className="text-sm text-base-content/70">
            Gérez les étages et espaces réservables de votre organisation.
          </p>
        </div>
        <button className="btn btn-primary btn-sm self-start md:self-auto">
          + New area
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Table des areas */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Enabled</th>
                    <th>Map</th>
                    <th>Booking link</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AREAS.map((area) => (
                    <tr key={area.id}>
                      <td>{area.name}</td>
                      <td>{area.enabled ? "yes" : "no"}</td>
                      <td>{area.mapSize}</td>
                      <td className="max-w-[160px]">
                       
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Plan visuel */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-3">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">{selectedArea.name} – visual editor</p>
                <p className="text-xs text-base-content/60">
                  Cliquez sur un espace pour voir le détail (mock).
                </p>
              </div>

              <div className="relative w-full border border-base-300 rounded-lg overflow-hidden bg-base-200">
                <img
                  src={floorplan}
                  alt="Floor plan"
                  className="w-full max-h-[420px] object-cover"
                />

                {/* Espaces positionnés en pourcentage, comme sur ton screenshot */}
                {selectedArea.spaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    className="absolute px-2 py-1 text-xs rounded-sm bg-green-500 text-white shadow-sm hover:shadow-md transition-shadow"
                    style={{
                      left: `${space.x}%`,
                      top: `${space.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {space.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-base-content/60">
                Plus tard, cette vue pourra devenir un véritable éditeur (drag & drop,
                création de zones, etc.). Pour l’instant, tout est purement mock côté
                front.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AreasPage;