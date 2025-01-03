import { componentInject } from 'app/shared/util/typed-inject';
import { Meta } from 'app/shared/model/firebase/firebase.model';
import React, { useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { getFirebaseMetaGenePath } from 'app/shared/util/firebase/firebase-utils';
import { BiInfoCircle } from 'react-icons/bi';

export interface IReadOnlyBanner extends StoreProps {
  hugoSymbol: string;
}

const ReadOnlyBanner = ({ isGermline, hugoSymbol, firebaseDb }: IReadOnlyBanner) => {
  const [meta, setMeta] = useState<Meta>();
  const firebaseMetaPath = useMemo(() => {
    return getFirebaseMetaGenePath(isGermline, hugoSymbol);
  }, [isGermline, hugoSymbol]);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const subscribe = onValue(ref(firebaseDb, firebaseMetaPath), snapshot => {
      setMeta(snapshot.val());
    });
    return () => subscribe?.();
  }, []);

  return meta ? (
    <div className="alert alert-primary alert-dismissible fade show d-flex align-items-center" role="alert">
      <BiInfoCircle size={25} className="me-2" />
      <span>
        {isGermline ? 'The germline ' : 'The somatic '}
        section is currently in read only mode because {meta.review.currentReviewer} is currently reviewing.
      </span>
    </div>
  ) : null;
};

const mapStoreToProps = ({ firebaseAppStore, routerStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  isGermline: routerStore.isGermline,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(ReadOnlyBanner));
