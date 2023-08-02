import React from 'react';
import { ProSidebar, SidebarContent, SidebarHeader } from 'react-pro-sidebar';
import './curation-panel.scss';
import CompanionDiagnosticDevicePanel from './CompanionDiagnosticDevicePanel';

const CurationPanel: React.FunctionComponent = () => {
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

export default CurationPanel;
