import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores/createStore';
import React, { useEffect } from 'react';
import { ProSidebar, SidebarContent, SidebarHeader } from 'react-pro-sidebar';
import { matchPath, useLocation } from 'react-router-dom';
import './curation-panel.scss';
import CompanionDiagnosticDevicePanel from './CompanionDiagnosticDevicePanel';

// Paths that should show the curation panel
const includedPaths = ['/companion-diagnostic-device/:id/edit'];

const CurationPanel: React.FunctionComponent<StoreProps> = props => {
  const location = useLocation();
  const matchedPath = includedPaths.filter(path => matchPath(location.pathname, { path, exact: true }))[0];

  useEffect(() => {
    const showOnMatchedPath = !!matchedPath;
    props.toggleCurationPanel(showOnMatchedPath);
  }, [location.pathname]);

  return (
    <div className="curation-sidebar-wrapper">
      <ProSidebar>
        <SidebarHeader>
          <div className="curation-sidebar-header">Curation Panel</div>
        </SidebarHeader>
        <SidebarContent>
          <CompanionDiagnosticDevicePanel />
        </SidebarContent>
      </ProSidebar>
    </div>
  );
};

const mapStoreToProps = ({ layoutStore }: IRootStore) => ({
  toggleCurationPanel: layoutStore.toggleCurationPanel,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CurationPanel);
