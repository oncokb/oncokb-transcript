import React, { useMemo, useState } from 'react';
import DefaultTooltip from '../tooltip/DefaultTooltip';
import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';

export interface IPMIDIFrameProps {
  pmid: string;
  children: React.ReactNode;
}

const DEFAULT_IFRAME_DIMENSIONS: React.CSSProperties = {
  height: '400px',
  width: '600px',
};

export const PMIDIFrame = (props: IPMIDIFrameProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const iFrameDimensions = useMemo(() => {
    return isLoading ? { width: 0, height: 0 } : DEFAULT_IFRAME_DIMENSIONS;
  }, [isLoading]);

  return (
    <DefaultTooltip
      destroyTooltipOnHide
      onVisibleChange={() => setIsLoading(true)}
      placement="bottom"
      overlayInnerStyle={{ width: 'fit-content', maxWidth: 'none' }}
      overlay={
        <div>
          {isLoading && (
            <div className="d-flex align-items-center justify-content-center" style={DEFAULT_IFRAME_DIMENSIONS}>
              <LoadingIndicator isLoading centerRelativeToContainer={true} />
            </div>
          )}

          <iframe
            style={{ border: 'none', ...iFrameDimensions }}
            src={`https://pubmed.ncbi.nlm.nih.gov/${props.pmid}`}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      }
    >
      {props.children}
    </DefaultTooltip>
  );
};

export default PMIDIFrame;
