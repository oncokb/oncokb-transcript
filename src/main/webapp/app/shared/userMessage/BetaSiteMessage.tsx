import React from 'react';
import * as styles from './styles.module.scss';
import { Container } from 'reactstrap';

export const BetaSiteMessage = () => {
  return (
    <div className={styles.message}>
      <Container className={styles.messageContainer}>
        <div>Please be advised that this the beta version of our site. Do not add any production data. </div>
      </Container>
    </div>
  );
};
