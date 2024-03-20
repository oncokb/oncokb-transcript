import React, { useEffect, useMemo, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import AddButton from '../button/AddButton';
import { PATHOGENIC_VARIANTS } from 'app/config/constants/firebase';
import { GenomicIndicator, Review } from 'app/shared/model/firebase/firebase.model';
import { onValue, ref } from 'firebase/database';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';

export interface IGenomicIndicatorsHeaderProps extends StoreProps {
  genomicIndicatorsPath: string;
}

function GenomicIndicatorsHeader({ genomicIndicatorsPath, firebaseDb, authStore, firebasePushToArray }: IGenomicIndicatorsHeaderProps) {
  const [genomicIndicators, setGenomicIndicators] = useState<GenomicIndicator[]>([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(firebaseDb, genomicIndicatorsPath), snapshot => {
      setGenomicIndicators(snapshot.val());
    });

    return () => unsubscribe?.();
  }, []);

  const isEmptyIndicatorName = useMemo(() => {
    return genomicIndicators?.some(indicator => !indicator.name) || false;
  }, [genomicIndicators]);

  function getAddButton() {
    const addButton = (
      <AddButton
        className="ml-2"
        disabled={isEmptyIndicatorName}
        onClickHandler={() => {
          const newGenomicIndicator = new GenomicIndicator();

          newGenomicIndicator.associationVariants = [{ name: PATHOGENIC_VARIANTS, uuid: PATHOGENIC_VARIANTS }];

          const newReview = new Review(authStore.fullName);
          newReview.updateTime = new Date().getTime();
          newReview.added = true;
          newGenomicIndicator.name_review = newReview;

          firebasePushToArray(genomicIndicatorsPath, [newGenomicIndicator]);
        }}
      />
    );

    if (!isEmptyIndicatorName) {
      return addButton;
    }
    return (
      <DefaultTooltip overlay={'All existing genomic indicators must have a name'} placement="top">
        <div>{addButton}</div>
      </DefaultTooltip>
    );
  }

  return (
    <div className={'d-flex align-items-center'}>
      <b>Genomic Indicators</b>
      {getAddButton()}
    </div>
  );
}

const mapStoreToProps = ({ firebaseStore, authStore, firebaseGeneStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
  authStore,
  firebasePushToArray: firebaseGeneStore.pushToArray,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GenomicIndicatorsHeader));
