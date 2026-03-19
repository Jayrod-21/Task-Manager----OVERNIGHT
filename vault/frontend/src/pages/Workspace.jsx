/**
 * Workspace page — renders WorkspaceView for the selected sub-workspace.
 *
 * Extracts the subWorkspaceId from the URL params and passes it
 * to WorkspaceView for task display and management.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onRefresh - Callback to refresh sidebar data.
 */

import { useParams } from 'react-router-dom'
import WorkspaceView from '../components/WorkspaceView'

function Workspace({ onRefresh }) {
  const { subWorkspaceId } = useParams()

  return <WorkspaceView subWorkspaceId={subWorkspaceId} onRefresh={onRefresh} />
}

export default Workspace
