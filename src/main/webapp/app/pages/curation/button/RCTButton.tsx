import { SPECIAL_CANCER_TYPES } from 'app/config/constants/constants';
import { RCT_MODAL_BUTTON_ID } from 'app/config/constants/html-id';
import { Implication, Treatment, Tumor } from 'app/shared/model/firebase/firebase.model';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Unsubscribe, onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { Button } from 'reactstrap';

export interface IRCTButtonProps extends StoreProps {
  cancerTypePath: string;
  relevantCancerTypesInfoPath: string; // path to dx, px, or tx
  readOnly?: boolean;
}

function RCTButton({
  cancerTypePath,
  relevantCancerTypesInfoPath,
  firebaseDb,
  relevantCancerTypesModalStore,
  readOnly = false,
}: IRCTButtonProps) {
  const [cancerType, setCancerType] = useState<Tumor>();
  const [relevantCancerTypesInfo, setRelevantCancerTypesInfo] = useState<Implication | Treatment>();

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, cancerTypePath), snapshot => {
        setCancerType(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, relevantCancerTypesInfoPath), snapshot => {
        setRelevantCancerTypesInfo(snapshot.val());
      }),
    );
  }, []);

  function handleClick() {
    relevantCancerTypesModalStore?.openModal(
      `${relevantCancerTypesInfoPath}/excludedRCTs`,
      cancerType,
      relevantCancerTypesInfo?.excludedRCTs_review,
      relevantCancerTypesInfo?.excludedRCTs_uuid,
      relevantCancerTypesInfo?.level || undefined,
      relevantCancerTypesInfo?.excludedRCTs,
    );
  }

  let disabled = true;
  let overlayText: string = '';
  if (cancerType && relevantCancerTypesInfo) {
    const cancerTypeContainsSpecialCancerType = Object.values(SPECIAL_CANCER_TYPES).some(specialCancerType =>
      cancerType.cancerTypes.some(ct => ct.mainType === (specialCancerType as string)),
    );
    if (cancerTypeContainsSpecialCancerType) {
      overlayText = 'This cancer type contains too many RCTs. Please modify the excluding cancer types instead.';
    } else if (!relevantCancerTypesInfo.level) {
      overlayText = 'Add a level of evidence to view RCTs';
    } else {
      disabled = false;
    }
  }

  const buttonComponent = (
    <Button
      style={{ padding: '.125rem .25rem', lineHeight: 1.2, fontSize: '.7rem' }}
      className="d-flex align-items-center"
      size="sm"
      color="primary"
      outline
      disabled={disabled || readOnly}
      onClick={handleClick}
      id={RCT_MODAL_BUTTON_ID}
    >
      <FaPen className="me-1" />
      <span>RCTs</span>
    </Button>
  );

  if (!disabled) {
    return buttonComponent;
  }
  return (
    <DefaultTooltip overlay={overlayText} placement="top">
      {buttonComponent}
    </DefaultTooltip>
  );
}

const mapStoreToProps = ({ firebaseAppStore, relevantCancerTypesModalStore, curationPageStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  relevantCancerTypesModalStore,
  readOnly: curationPageStore.readOnly,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(RCTButton));
