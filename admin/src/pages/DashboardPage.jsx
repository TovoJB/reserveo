const MOCK_STATS = {
  users: 42,
  activeAreas: 2,
  spaces: 20,
  todaysBookings: 6,
  utilizationToday: 65,
  utilizationWeek: 48,
  utilizationMonth: 53,
};

const MOCK_RECENT_BOOKINGS = [
  {
    id: "BK-0245",
    space: "Desk 3",
    area: "Sample Floor",
    from: "Today 14:00",
    to: "Today 17:00",
    user: "Jim Halpert",
    status: "confirmed",
  },
  {
    id: "BK-0244",
    space: "Conference 1",
    area: "Sample Floor",
    from: "Today 10:00",
    to: "Today 12:00",
    user: "Michael Scott",
    status: "checked-in",
  },
  {
    id: "BK-0243",
    space: "Desk 9",
    area: "Sample Floor",
    from: "Yesterday 15:00",
    to: "Yesterday 18:00",
    user: "Pam Beesly",
    status: "completed",
  },
];

function StatCard({ label, value, hint }) {
  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body gap-2">
        <p className="text-xs uppercase tracking-wide text-base-content/60">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {hint && <p className="text-xs text-base-content/60">{hint}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 rounded-full bg-base-300 overflow-hidden">
      <div
        className="h-full bg-primary transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
          <p className="text-sm text-base-content/70">
            Utilisation des espaces, réservations et activité des utilisateurs.
          </p>
        </div>
        <span className="badge badge-outline badge-sm self-start md:self-auto">
          Organizer · Sample workspace
        </span>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Utilisateurs actifs"
          value={MOCK_STATS.users}
          hint="+4 nouveaux cette semaine"
        />
        <StatCard
          label="Espaces"
          value={`${MOCK_STATS.spaces} desks`}
          hint={`${MOCK_STATS.activeAreas} zones actives`}
        />
        <StatCard
          label="Réservations aujourd'hui"
          value={MOCK_STATS.todaysBookings}
          hint="0 no‑show pour le moment"
        />
        <StatCard
          label="Taux d'occupation moyen"
          value={`${MOCK_STATS.utilizationWeek}%`}
          hint="Semaine en cours"
        />
      </div>

      {/* Utilization + bookings */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Utilization panel */}
        <div className="card bg-base-100 shadow-sm lg:col-span-2">
          <div className="card-body gap-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="card-title text-base">Utilisation</h3>
                <p className="text-xs text-base-content/70">Today vs week vs month</p>
              </div>
              <span className="badge badge-primary badge-sm">Live</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Aujourd'hui</span>
                  <span>{MOCK_STATS.utilizationToday}%</span>
                </div>
                <ProgressBar value={MOCK_STATS.utilizationToday} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Cette semaine</span>
                  <span>{MOCK_STATS.utilizationWeek}%</span>
                </div>
                <ProgressBar value={MOCK_STATS.utilizationWeek} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Ce mois</span>
                  <span>{MOCK_STATS.utilizationMonth}%</span>
                </div>
                <ProgressBar value={MOCK_STATS.utilizationMonth} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent bookings */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body gap-3">
            <h3 className="card-title text-base">Réservations récentes</h3>
            <div className="space-y-3">
              {MOCK_RECENT_BOOKINGS.map((b) => (
                <div
                  key={b.id}
                  className="rounded-lg border border-base-300 px-3 py-2 text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {b.space} · <span className="text-base-content/60">{b.area}</span>
                    </p>
                    <span className="badge badge-ghost badge-xs">{b.status}</span>
                  </div>
                  <p className="text-base-content/70">
                    {b.from} → {b.to}
                  </p>
                  <p className="text-[11px] text-base-content/60">Par {b.user}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;