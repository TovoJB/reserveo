const MOCK_SERIES = [
    { label: "Mon", value: 30 },
    { label: "Tue", value: 45 },
    { label: "Wed", value: 55 },
    { label: "Thu", value: 38 },
    { label: "Fri", value: 62 },
  ];
  
  function AnalyticsPage() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-base-content/70">
            Statistiques d’occupation et de réservations (mock).
          </p>
        </div>
  
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <p className="text-xs text-base-content/60">Peak utilization (week)</p>
              <p className="text-2xl font-semibold">82%</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <p className="text-xs text-base-content/60">Average booking length</p>
              <p className="text-2xl font-semibold">2.3 h</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <p className="text-xs text-base-content/60">Most used area</p>
              <p className="text-2xl font-semibold">Sample Floor</p>
            </div>
          </div>
        </div>
  
        {/* Mini "chart" CSS */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <p className="text-sm font-medium mb-4">Utilisation par jour (mock)</p>
            <div className="flex items-end gap-3 h-40">
              {MOCK_SERIES.map((p) => (
                <div key={p.label} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary"
                    style={{ height: `${p.value + 10}%` }}
                  />
                  <span className="text-xs text-base-content/70">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default AnalyticsPage;