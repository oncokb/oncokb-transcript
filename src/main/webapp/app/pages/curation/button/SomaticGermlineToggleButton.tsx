import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { get, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { Button, ButtonGroup } from 'reactstrap';
import styles from './styles.module.scss';

const BUTTON_WIDTH = 130;

export interface ISomaticGermlineToggleButtonProps extends StoreProps {
  hugoSymbol: string;
}

function SomaticGermlineToggleButton({ hugoSymbol, firebaseDb, createGene }: ISomaticGermlineToggleButtonProps) {
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
        await createGene(hugoSymbol, true);
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

const mapStoreToProps = ({ firebaseAppStore, firebaseGeneService }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  createGene: firebaseGeneService.createGene,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(SomaticGermlineToggleButton));
