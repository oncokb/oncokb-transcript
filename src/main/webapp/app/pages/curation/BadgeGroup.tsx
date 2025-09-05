import DefaultBadge from 'app/shared/badge/DefaultBadge';
import NoEntryBadge from 'app/shared/badge/NoEntryBadge';
import NotCuratableBadge from 'app/shared/badge/NotCuratableBadge';
import { isSectionEmpty } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { Unsubscribe, onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';

export const DELETED_SECTION_TOOLTIP_OVERLAY = (
  <div>
    <div>This deletion is pending for review.</div>
    <div>To confirm or revert the deletion, please enter review mode.</div>
  </div>
);

export const DEMOTED_MUTATION_TOOLTIP_OVERLAY = (
  <div>
    <div>This mutation is pending demotion to VUS.</div>
    <div>To confirm or revert the demotion, please enter review mode.</div>
  </div>
);

export interface IBadgeGroupProps extends StoreProps {
  firebasePath: string;
  showNotCuratableBadge?: {
    show: boolean;
    mutationName: string;
  };
  showDeletedBadge?: boolean;
  showDemotedBadge?: boolean;
}

const BadgeGroup = (props: IBadgeGroupProps) => {
  const [sectionData, setSectionData] = useState(null);

  useEffect(() => {
    if (!props.firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    if (!props.showDeletedBadge && !props.showNotCuratableBadge?.show) {
      callbacks.push(
        onValue(ref(props.firebaseDb, props.firebasePath), snapshot => {
          setSectionData(snapshot.val());
        }),
      );
    }
    return () => callbacks.forEach(callback => callback?.());
  }, [props.showDeletedBadge, props.showNotCuratableBadge]);

  const showNoEntryBadge = useMemo(() => {
    if (sectionData) {
      return isSectionEmpty(sectionData, props.firebasePath);
    }
    return false;
  }, [sectionData, props.firebasePath]);

  if (props.showDemotedBadge) {
    return <DefaultBadge color="danger" text="Demoted" tooltipOverlay={DEMOTED_MUTATION_TOOLTIP_OVERLAY} />;
  }

  if (props.showDeletedBadge) {
    return <DefaultBadge color="danger" text="Deleted" tooltipOverlay={DELETED_SECTION_TOOLTIP_OVERLAY} />;
  }

  if (props.showNotCuratableBadge?.show) {
    return <NotCuratableBadge mutationName={props.showNotCuratableBadge.mutationName} />;
  }

  if (showNoEntryBadge) {
    return <NoEntryBadge />;
  }
  return <></>;
};

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(BadgeGroup));
