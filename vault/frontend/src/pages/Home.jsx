/**
 * Home page — renders the Dashboard as the default view.
 *
 * This is the landing page shown at the root URL ("/").
 * Displays aggregated task metrics across all workspaces.
 *
 * @component
 */

import Dashboard from '../components/Dashboard'

function Home() {
  return <Dashboard />
}

export default Home
