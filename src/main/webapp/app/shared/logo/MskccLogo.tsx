import React from 'react';
import mskLogo from '../../../content/images/msk-logo-primary-sans-medium-navy.svg';
import mskIcon from '../../../content/images/msk-logo-arrow-sans-medium-navy.svg';
import OptimizedImage from 'app/oncokb-commons/components/image/OptimizedImage';

interface IMskccLogoProps {
  imageHeight?: number;
  size?: 'sm' | 'lg';
  className?: string;
}

export const MskccLogo: React.FunctionComponent<IMskccLogoProps> = props => {
  return (
    <a href="https://www.mskcc.org" target="_blank" rel="noopener noreferrer" className={props.className} style={{ display: 'block' }}>
      <OptimizedImage
        alt="mskcc-logo"
        src={props.size === 'lg' ? mskLogo : mskIcon}
        style={{
          height: props.imageHeight || 35,
        }}
      />
    </a>
  );
};
