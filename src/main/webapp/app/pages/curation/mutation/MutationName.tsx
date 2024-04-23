import React, { useState, useEffect } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';

interface IMutationNameProps extends StoreProps {
  mutationPath: string;
}

function MutationName({ mutationPath, firebaseDb }: IMutationNameProps) {
  const [mutationName, setMutationName] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const unsubscribe = onValue(ref(firebaseDb, `${mutationPath}/name`), snapshot => {
      setMutationName(snapshot.val());
    });

    return () => unsubscribe?.();
  }, [mutationPath]);

  return <span>{mutationName}</span>;
}

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationName));
