function SettingsPage() {
    return (
      <div className="space-y-6 max-w-xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-base-content/70">
            Préférences générales de l’espace de travail (mock, pas encore connecté au
            backend).
          </p>
        </div>
  
        <form className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium">Workspace name</span>
            </label>
            <input
              type="text"
              defaultValue="Dunder Mifflin Scranton"
              className="input input-bordered"
            />
          </div>
  
          <div className="form-control">
            <label className="label cursor-pointer justify-between">
              <span className="label-text text-sm font-medium">
                Autoriser les réservations en dehors des heures de bureau
              </span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
          </div>
  
          <button type="button" className="btn btn-primary btn-sm">
            Save (mock)
          </button>
        </form>
      </div>
    );
  }
  
  export default SettingsPage;