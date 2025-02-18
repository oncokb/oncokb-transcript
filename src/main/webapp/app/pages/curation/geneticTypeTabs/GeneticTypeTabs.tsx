import React, { useEffect, useMemo, useState } from 'react';
import * as styles from './genetic-type-tabs.module.scss';
import classnames from 'classnames';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { IGene } from 'app/shared/model/gene.model';
import DefaultBadge from 'app/shared/badge/DefaultBadge';
import { geneMetaReviewHasUuids, getFirebaseMetaGenePath } from 'app/shared/util/firebase/firebase-utils';
import { GERMLINE_PATH, SOMATIC_GERMLINE_SETTING_KEY, SOMATIC_PATH } from 'app/config/constants/constants';
import { onValue, ref, Unsubscribe } from 'firebase/database';
import { useLocation } from 'react-router-dom';
import { MetaReview } from 'app/shared/model/firebase/firebase.model';

export enum GENETIC_TYPE {
  SOMATIC = 'somatic',
  GERMLINE = 'germline',
}

export interface IGeneticTypeTabs extends StoreProps {
  geneEntity: IGene;
  geneticType: GENETIC_TYPE;
}

const GeneticTypeTabs = ({ geneEntity, geneticType, firebaseDb }: IGeneticTypeTabs) => {
  const { pathname } = useLocation();
  const [selected, setSelected] = useState<GENETIC_TYPE>(geneticType || GENETIC_TYPE.SOMATIC);
  const [somaticMetaReview, setSomaticMetaReview] = useState<MetaReview>();
  const [germlineMetaReview, setGermlineMetaReview] = useState<MetaReview>();

  const currentVariantType = selected === GENETIC_TYPE.SOMATIC ? SOMATIC_PATH : GERMLINE_PATH;
  const newVariantType = selected === GENETIC_TYPE.SOMATIC ? GERMLINE_PATH : SOMATIC_PATH;

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks = [] as Unsubscribe[];
    callbacks.push(
      onValue(ref(firebaseDb, `${getFirebaseMetaGenePath(false, geneEntity.hugoSymbol)}/review`), snapshot => {
        setSomaticMetaReview(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, `${getFirebaseMetaGenePath(true, geneEntity.hugoSymbol)}/review`), snapshot => {
        setGermlineMetaReview(snapshot.val());
      }),
    );
    return () => callbacks.forEach(callback => callback?.());
  }, []);

  const geneReleaseStatus = useMemo(() => {
    const somaticStatus = !!geneEntity?.flags?.find(flag => flag.flag === 'ONCOKB_SOMATIC' && flag.name === 'OncoKB Somatic');
    const germlineStatus = !!geneEntity?.flags?.find(flag => flag.flag === 'ONCOKB_GERMLINE' && flag.name === 'OncoKB Germline');
    return {
      [GENETIC_TYPE.SOMATIC]: somaticStatus,
      [GENETIC_TYPE.GERMLINE]: germlineStatus,
    };
  }, [geneEntity]);

  const getGeneReleaseStatusBadge = (type: GENETIC_TYPE) => {
    const badges: JSX.Element[] = [];
    const sharedClassname = 'ms-2';
    const sharedStyle: React.CSSProperties = { fontSize: '0.8rem' };

    const needsReview = {
      [GENETIC_TYPE.SOMATIC]: geneMetaReviewHasUuids(somaticMetaReview),
      [GENETIC_TYPE.GERMLINE]: geneMetaReviewHasUuids(germlineMetaReview),
    };
    if (needsReview[type]) {
      badges.push(
        <DefaultBadge square color={'warning'} className={sharedClassname} style={sharedStyle} key={`${type}-needs-review-badge`}>
          Needs Review
        </DefaultBadge>,
      );
    }

    const isGeneReleased = geneReleaseStatus[type];
    if (isGeneReleased) {
      // Todo: In tooltip show when gene was released
      badges.push(
        <DefaultBadge square color="success" className={sharedClassname} style={sharedStyle} key={`${type}-released-badge`}>
          Released
        </DefaultBadge>,
      );
    } else {
      badges.push(
        <DefaultBadge square color={'warning'} className={sharedClassname} style={sharedStyle} key={`${type}-pending-release-badge`}>
          Pending Release
        </DefaultBadge>,
      );
    }

    return <>{badges.map(badge => badge)}</>;
  };

  function handleToggle() {
    localStorage.setItem(SOMATIC_GERMLINE_SETTING_KEY, newVariantType);
    window.location.href = pathname.replace(currentVariantType, newVariantType);
  }

  return (
    <div className={styles.tabs}>
      {[GENETIC_TYPE.SOMATIC, GENETIC_TYPE.GERMLINE].map((geneOrigin, idx) => (
        <div
          key={idx}
          style={{ width: '50%' }}
          className={
            selected === geneOrigin ? classnames(styles.tab, styles.selectedTab, 'fw-bold') : classnames(styles.tab, styles.unselectedTab)
          }
          onClick={handleToggle}
        >
          {geneOrigin.substring(0, 1).toUpperCase()}
          {geneOrigin.toLowerCase().slice(1)}
          {getGeneReleaseStatusBadge(geneOrigin)}
        </div>
      ))}
    </div>
  );
};

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GeneticTypeTabs));
