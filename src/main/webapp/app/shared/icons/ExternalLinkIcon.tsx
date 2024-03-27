import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const ExternalLinkIcon: React.FunctionComponent = props => {
  return <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" />;
};

export default ExternalLinkIcon;
