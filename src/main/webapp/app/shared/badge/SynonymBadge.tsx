import React from 'react';
import { ISynonym } from 'app/shared/model/synonym.model';
import { Badge } from 'reactstrap';

const SynonymBadge: React.FunctionComponent<{ synonym: ISynonym }> = props => {
  const synonym = props.synonym;
  return (
    <Badge key={`${synonym.type}-${synonym.source}-${synonym.name}`} pill color="info" className={'mr-2'}>
      {synonym.name} ({synonym.source})
    </Badge>
  );
};
export default SynonymBadge;
