import React from 'react';
import { Linkout } from './Linkout';

const SOP_LINK = 'https://sop.oncokb.org';

export const SopPageLink: React.FunctionComponent<{
  version?: number;
}> = props => {
  let link = SOP_LINK;
  let defaultContent = 'OncoKB SOP';
  if (props.version) {
    link += `/?version=v${props.version}`;
    defaultContent += ` v${props.version}`;
  }
  return <Linkout to={link}>{props.children || defaultContent}</Linkout>;
};
