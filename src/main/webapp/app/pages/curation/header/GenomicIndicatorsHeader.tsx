import React, { useEffect, useMemo, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import AddButton from '../button/AddButton';
import { PATHOGENIC_VARIANTS } from 'app/config/constants/firebase';
import { GenomicIndicator, Review } from 'app/shared/model/firebase/firebase.model';
import { onValue, ref } from 'firebase/database';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';

export interface IGenomicIndicatorsHeaderProps extends StoreProps {
  genomicIndicatorsPath: string;
}

function GenomicIndicatorsHeader({ genomicIndicatorsPath, firebaseDb, authStore, addGenomicIndicator }: IGenomicIndicatorsHeaderProps) {
  const [genomicIndicators, setGenomicIndicators] = useState<GenomicIndicator[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const unsubscribe = onValue(ref(firebaseDb, genomicIndicatorsPath), snapshot => {
      setGenomicIndicators(snapshot.val());
    });

    return () => unsubscribe?.();
  }, []);

  const isEmptyIndicatorName = useMemo(() => {
    return genomicIndicators?.some(indicator => !indicator.name) || false;
  }, [genomicIndicators]);

  const isGenomicIndicator = genomicIndicators?.length > 0;

  function getAddButton() {
    const addButton = (
      <AddButton
        className={classNames(isGenomicIndicator ? 'ml-2' : null)}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        title={!isGenomicIndicator ? 'Genomic Indicators' : null}
        disabled={isEmptyIndicatorName}
        onClickHandler={() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          addGenomicIndicator(genomicIndicatorsPath);
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
      {isGenomicIndicator && <b>Genomic Indicators</b>}
      {getAddButton()}
    </div>
  );
}

const mapStoreToProps = ({ firebaseAppStore, authStore, firebaseGeneService }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  authStore,
  addGenomicIndicator: firebaseGeneService.addGenomicIndicator,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GenomicIndicatorsHeader));
