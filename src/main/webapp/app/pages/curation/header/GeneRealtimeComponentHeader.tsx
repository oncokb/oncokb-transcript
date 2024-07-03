import GeneHistoryTooltip from 'app/components/geneHistoryTooltip/GeneHistoryTooltip';
import CommentIcon from 'app/shared/icons/CommentIcon';
import React from 'react';

export interface IGeneRealtimeComponentHeaderProps {
  title?: string;
  tooltip: React.ReactElement<typeof GeneHistoryTooltip>;
  commentIcon: React.ReactElement<typeof CommentIcon>;
}

export default function GeneRealtimeComponentHeader({ title, tooltip, commentIcon }: IGeneRealtimeComponentHeaderProps) {
  return (
    <>
      {title && <span style={{ marginRight: '8px' }}>{title}</span>}
      {tooltip}
      <div className="me-3" />
      {commentIcon}
    </>
  );
}
