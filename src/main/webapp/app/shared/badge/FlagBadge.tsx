import { IFlag } from 'app/shared/model/flag.model';
import Tooltip from 'rc-tooltip';
import React from 'react';

const FlagBadge: React.FunctionComponent<{ flag: IFlag; tagClassName: string }> = props => {
  return (
    <Tooltip placement="top" overlay={<span>{props.flag.description}</span>}>
      <span className={`badge rounded-pill text-bg-info ${props.tagClassName}`}>{props.flag.name}</span>
    </Tooltip>
  );
};
export default FlagBadge;
