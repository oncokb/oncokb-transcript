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
import * as styles from './styles.module.scss';
import { GERMLINE_PATH, SOMATIC_GERMLINE_SETTING_KEY, SOMATIC_PATH } from 'app/config/constants/constants';
import { GERMLINE_TOGGLE_BUTTON_ID, SOMATIC_TOGGLE_BUTTON_ID } from 'app/config/constants/html-id';

const BUTTON_WIDTH = 130;

export interface ISomaticGermlineToggleButtonProps extends StoreProps {
  hugoSymbol?: string;
}

function SomaticGermlineToggleButton({ hugoSymbol, firebaseDb, createGene }: ISomaticGermlineToggleButtonProps) {
  const { pathname } = useLocation();
  const isSomatic = !pathname.includes(GERMLINE_PATH);

  const currentVariantType = isSomatic ? SOMATIC_PATH : GERMLINE_PATH;
  const newVariantType = isSomatic ? GERMLINE_PATH : SOMATIC_PATH;

  async function handleToggle() {
    if (!firebaseDb) {
      return;
    }
    if (hugoSymbol) {
      // On curation page
      const genePath = getFirebasePath(isSomatic ? 'GENE' : 'GERMLINE_GENE', hugoSymbol);
      try {
        const snapshot = await get(ref(firebaseDb, genePath));
        if (!snapshot.exists()) {
          await createGene?.(hugoSymbol, !isSomatic);
        }
      } catch (error) {
        notifyError(error);
      }
    }
    localStorage.setItem(SOMATIC_GERMLINE_SETTING_KEY, newVariantType);
    window.location.href = pathname.replace(currentVariantType, newVariantType);
  }

  return (
    <ButtonGroup>
      <Button
        className={styles.btn}
        color={isSomatic ? 'primary' : 'secondary'}
        style={{ width: BUTTON_WIDTH }}
        disabled={isSomatic}
        onClick={handleToggle}
        data-testid={SOMATIC_TOGGLE_BUTTON_ID}
      >
        {isSomatic && <FaCheckCircle className="me-2" style={{ marginBottom: '.1rem' }} />}
        <span>Somatic</span>
      </Button>
      <Button
        className={styles.btn}
        color={isSomatic ? 'secondary' : 'warning'}
        style={{ width: BUTTON_WIDTH }}
        disabled={!isSomatic}
        onClick={handleToggle}
        data-testid={GERMLINE_TOGGLE_BUTTON_ID}
      >
        {!isSomatic && <FaCheckCircle className="me-2" style={{ marginBottom: '.1rem' }} />}
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
