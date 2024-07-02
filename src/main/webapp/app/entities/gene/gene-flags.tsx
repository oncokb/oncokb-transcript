import React from 'react';
import FlagBadge from 'app/shared/badge/FlagBadge';
import { IFlag } from 'app/shared/model/flag.model';

const GeneFlags: React.FunctionComponent<{ flags: IFlag[] | undefined }> = props => {
  return <>{props.flags ? props.flags.map(flag => <FlagBadge key={flag.flag} flag={flag} tagClassName={'me-1'} />) : <span></span>}</>;
};
export default GeneFlags;
