import React from 'react';
import './curation-panel.scss';
import CompanionDiagnosticDevicePanel from './CompanionDiagnosticDevicePanel';

interface ICurationPanelProps {
  width: string | number;
}

const CurationPanel = (props: ICurationPanelProps) => {
  return (
    <div className="curation-sidebar-wrapper" style={{ width: props.width }}>
      <h4 style={{ margin: '2rem 1rem' }}>Curation Panel</h4>
      <CompanionDiagnosticDevicePanel />
    </div>
  );
};

export default CurationPanel;
