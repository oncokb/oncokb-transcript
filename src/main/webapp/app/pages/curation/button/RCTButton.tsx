import { SPECIAL_CANCER_TYPES } from 'app/config/constants/constants';
import { Implication, Treatment, Tumor } from 'app/shared/model/firebase/firebase.model';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
import { Button } from 'reactstrap';

export interface IRCTButtonProps extends StoreProps {
  cancerTypePath: string;
  relevantCancerTypesInfoPath: string; // path to dx, px, or tx
}

function RCTButton({ cancerTypePath, relevantCancerTypesInfoPath, firebaseDb, relevantCancerTypesModalStore }: IRCTButtonProps) {
  const [cancerType, setCancerType] = useState<Tumor>(null);
  const [relevantCancerTypesInfo, setRelevantCancerTypesInfo] = useState<Implication | Treatment>(null);

  useEffect(() => {
    const callbacks = [];
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
    relevantCancerTypesModalStore.openModal(
      `${relevantCancerTypesInfoPath}/excludedRCTs`,
      cancerType,
      relevantCancerTypesInfo.excludedRCTs_review,
      relevantCancerTypesInfo.excludedRCTs_uuid,
      relevantCancerTypesInfo.level || null,
      relevantCancerTypesInfo.excludedRCTs,
    );
  }

  let disabled = true;
  let overlayText: string;
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
      disabled={disabled}
      onClick={handleClick}
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

const mapStoreToProps = ({ firebaseAppStore, relevantCancerTypesModalStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  relevantCancerTypesModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(RCTButton));
