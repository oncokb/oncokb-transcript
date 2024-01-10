import { IGeneFlag } from 'app/shared/model/gene-flag.model';
import React from 'react';
import FlagBadge from 'app/shared/badge/FlagBadge';

const GeneFlags: React.FunctionComponent<{ flags: IGeneFlag[] | undefined }> = props => {
  return <>{props.flags ? props.flags.map(flag => <FlagBadge key={flag.flag} flag={flag} tagClassName={'mr-1'} />) : <span></span>}</>;
};
export default GeneFlags;
