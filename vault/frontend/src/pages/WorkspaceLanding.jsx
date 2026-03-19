/**
 * WorkspaceLanding page — renders WorkspaceLanding for the selected workspace.
 *
 * Extracts workspaceId from URL params and passes it to the
 * WorkspaceLanding component for sub-workspace overview.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onRefresh - Callback to refresh sidebar data.
 */

import { useParams } from 'react-router-dom'
import WorkspaceLanding from '../components/WorkspaceLanding'

function WorkspacePage({ onRefresh }) {
  const { workspaceId } = useParams()

  return <WorkspaceLanding workspaceId={workspaceId} onRefresh={onRefresh} />
}

export default WorkspacePage
