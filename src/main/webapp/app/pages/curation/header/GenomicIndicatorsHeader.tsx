import React, { useEffect, useMemo, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import AddButton from '../button/AddButton';
import { PATHOGENIC_VARIANTS } from 'app/config/constants/firebase';
import { GenomicIndicator, GenomicIndicatorList, Review } from 'app/shared/model/firebase/firebase.model';
import { onValue, ref } from 'firebase/database';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';

export interface IGenomicIndicatorsHeaderProps extends StoreProps {
  genomicIndicatorsPath: string;
}

function GenomicIndicatorsHeader({
  genomicIndicatorsPath,
  firebaseDb,
  addEmptyGenomicIndicator,
  fetchGenomicIndicators,
  readOnly,
}: IGenomicIndicatorsHeaderProps) {
  const [genomicIndicators, setGenomicIndicators] = useState<GenomicIndicatorList | null>({});

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const unsubscribe = onValue(ref(firebaseDb, genomicIndicatorsPath), snapshot => {
      setGenomicIndicators(snapshot.val());
    });

    return () => unsubscribe?.();
  }, []);

  const isEmptyIndicatorName = useMemo(() => {
    return Object.values(genomicIndicators ?? {})?.some(indicator => !indicator.name) || false;
  }, [genomicIndicators]);

  const isGenomicIndicator = Object.keys(genomicIndicators ?? {})?.length > 0;

  function getAddButton() {
    const addButton = (
      <AddButton
        className={classNames(isGenomicIndicator ? 'ms-2' : null)}
        title={!isGenomicIndicator ? 'Genomic Indicators' : undefined}
        disabled={isEmptyIndicatorName || readOnly}
        onClickHandler={async () => {
          await addEmptyGenomicIndicator?.(genomicIndicatorsPath);
          await fetchGenomicIndicators?.(genomicIndicatorsPath);
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

const mapStoreToProps = ({
  firebaseAppStore,
  authStore,
  firebaseGeneService,
  firebaseGenomicIndicatorsStore,
  curationPageStore,
}: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  authStore,
  addEmptyGenomicIndicator: firebaseGeneService.addEmptyGenomicIndicator,
  fetchGenomicIndicators: firebaseGenomicIndicatorsStore.fetchData,
  readOnly: curationPageStore.readOnly,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GenomicIndicatorsHeader));
