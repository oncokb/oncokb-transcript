import React from 'react';
import { Linkout } from 'app/shared/links/Linkout';
import * as styles from './external-link-icon.module.scss';
import { FaExternalLinkAlt } from 'react-icons/fa';

const ExternalLinkIcon: React.FunctionComponent<{
  link: string;
  className?: string;
}> = props => {
  return (
    <Linkout to={props.link} className={styles.externalLinkContainer}>
      <span className={styles.externalLinkContent}>{props.children}</span>
      <FaExternalLinkAlt className={styles.icon} />
    </Linkout>
  );
};
export default ExternalLinkIcon;
