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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [cancerType, setCancerType] = useState<Tumor>(null);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [relevantCancerTypesInfo, setRelevantCancerTypesInfo] = useState<Implication | Treatment>(null);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, cancerTypePath), snapshot => {
        setCancerType(snapshot.val());
      })
    );
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, relevantCancerTypesInfoPath), snapshot => {
        setRelevantCancerTypesInfo(snapshot.val());
      })
    );
  }, []);

  function handleClick() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    relevantCancerTypesModalStore.openModal(
      `${relevantCancerTypesInfoPath}/excludedRCTs`,
      cancerType,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      relevantCancerTypesInfo.excludedRCTs_review,
      relevantCancerTypesInfo.excludedRCTs_uuid,
      relevantCancerTypesInfo.level || null,
      relevantCancerTypesInfo.excludedRCTs
    );
  }

  let disabled = true;
  let overlayText: string;
  if (cancerType && relevantCancerTypesInfo) {
    const cancerTypeContainsSpecialCancerType = Object.values(SPECIAL_CANCER_TYPES).some(specialCancerType =>
      cancerType.cancerTypes.some(ct => ct.mainType === specialCancerType)
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
      <FaPen className="mr-1" />
      <span>RCTs</span>
    </Button>
  );

  if (!disabled) {
    return buttonComponent;
  }
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
