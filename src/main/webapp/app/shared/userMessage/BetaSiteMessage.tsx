import React from 'react';
import * as styles from './styles.module.scss';
import { Container } from 'reactstrap';
import { BANNER_HEIGHT } from 'app/stores/layout.store';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';

const BetaSiteMessage = (props: StoreProps) => {
  if (!props.isBeta) {
    return <></>;
  }

  return (
    <div className={styles.message} style={{ height: BANNER_HEIGHT }}>
      <Container className={styles.messageContainer}>
        <div>Please be advised that this the beta version of our site. Do not add any production data. </div>
      </Container>
    </div>
  );
};

const mapStoreToProps = ({ windowStore }: IRootStore) => ({
  isBeta: windowStore.isBeta,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(BetaSiteMessage));
