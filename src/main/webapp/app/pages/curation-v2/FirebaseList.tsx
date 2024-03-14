import React, { useEffect, useMemo, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { onValue, ref } from 'firebase/database';
import { ViewportList, ViewportListPropsBase } from 'react-viewport-list';

export interface IFirebaseListProps extends StoreProps, ViewportListPropsBase {
  path: string;
  itemBuilder: (firebaseIndex: number) => React.ReactNode;
  filter?: (firebaseIndex: number) => boolean;
  onLengthChange?: (oldLength: number, newLength: number) => void;
}

function FirebaseList({ path, itemBuilder, filter, onLengthChange, firebaseDb, ...rest }: IFirebaseListProps) {
  const [length, setLength] = useState<number>(0);

  useEffect(() => {
    const listRef = ref(firebaseDb, path);
    const unsubscribe = onValue(listRef, snapshot => {
      if (snapshot.size !== length) {
        setLength(snapshot.size);
        onLengthChange?.(length, snapshot.size);
      }
    });

    return () => unsubscribe?.();
  }, [length, onLengthChange]);

  const listItems = useMemo(() => {
    const items: JSX.Element[] = [];
    for (let i = 0; i < length; i++) {
      items.push(<div key={i}>{itemBuilder(i)}</div>); // is using index as key ok? I think it might since firebase order not chagning
    }
    return items;
  }, [length]);

  function getList() {
    if (!filter) {
      return listItems;
    }
    return listItems.filter((_item, index) => filter(index));
  }

  return (
    <ViewportList {...rest} items={getList()}>
      {item => item}
    </ViewportList>
  );
}

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(FirebaseList));
