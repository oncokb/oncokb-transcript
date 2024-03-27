import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { ButtonGroup, Button } from 'reactstrap';
import styles from './styles.module.scss';
import { get, ref } from 'firebase/database';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { Gene } from 'app/shared/model/firebase/firebase.model';

const BUTTON_WIDTH = 130;

export interface ISomaticGermlineToggleButtonProps extends StoreProps {
  hugoSymbol: string;
}

function SomaticGermlineToggleButton({ hugoSymbol, firebaseDb, firebaseCreateUntemplated }: ISomaticGermlineToggleButtonProps) {
  const { pathname } = useLocation();
  const isSomatic = !pathname.includes('germline');

  function handleSomaticClicked() {
    window.location.href = pathname.replace('germline', 'somatic');
  }

  async function handleGermlineClicked() {
    const germlineGenePath = getFirebasePath('GERMLINE_GENE', hugoSymbol);

    try {
      const snapshot = await get(ref(firebaseDb, germlineGenePath));
      if (!snapshot.exists()) {
        await firebaseCreateUntemplated(germlineGenePath, new Gene(hugoSymbol));
      }
      window.location.href = pathname.replace('somatic', 'germline');
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <ButtonGroup>
      <Button
        className={styles.btn}
        color={isSomatic ? 'primary' : 'secondary'}
        style={{ width: BUTTON_WIDTH }}
        disabled={isSomatic}
        onClick={handleSomaticClicked}
      >
        {isSomatic && <FaCheckCircle className="mr-2" style={{ marginBottom: '.1rem' }} />}
        <span>Somatic</span>
      </Button>
      <Button
        className={styles.btn}
        color={isSomatic ? 'secondary' : 'warning'}
        style={{ width: BUTTON_WIDTH }}
        disabled={!isSomatic}
        onClick={handleGermlineClicked}
      >
        {!isSomatic && <FaCheckCircle className="mr-2" style={{ marginBottom: '.1rem' }} />}
        <span>Germline</span>
      </Button>
    </ButtonGroup>
  );
}

const mapStoreToProps = ({ firebaseStore, firebaseCrudStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
  firebaseCreateUntemplated: firebaseCrudStore.createUntemplated,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(SomaticGermlineToggleButton));
