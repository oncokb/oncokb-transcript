import React, { useEffect, useMemo, useRef, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { onValue, ref } from 'firebase/database';
import InfiniteScroll from '@larryyangsen/react-infinite-scroller';
import _ from 'lodash';

export interface IFirebaseListProps<T> extends StoreProps {
  path: string;
  itemBuilder: (firebaseIndex: number) => React.ReactNode;
  pushDirection: 'front' | 'back';
  scrollOptions?: {
    viewportHeight: number;
    renderCount: number;
  };
  filter?: (firebaseIndex: number) => boolean;
  defaultSort?: (a: T, b: T) => number;
  onInitialRender?: () => void;
}

function FirebaseList<T>({
  path,
  itemBuilder,
  pushDirection,
  scrollOptions,
  filter,
  defaultSort,
  onInitialRender,
  firebaseDb,
}: IFirebaseListProps<T>) {
  const [indices, setIndices] = useState<number[]>(null);
  const [numItemsAdded, setNumItemsAdded] = useState(0);
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);

  // Only used when scrollOptions is set
  const [maxItemsRendered, setMaxItemsRendered] = useState(scrollOptions?.renderCount);
  const [initialLoad, setInitialLoad] = useState(false);

  useEffect(() => {
    // https://webperf.tips/tip/measuring-paint-time/
    if (!onInitialRender || initialRenderComplete || !indices) {
      return;
    }

    requestAnimationFrame(() => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = () => {
        onInitialRender();
        setInitialRenderComplete(true);
      };
      messageChannel.port2.postMessage(undefined);
    });
  }, [indices, initialRenderComplete]);

  useEffect(() => {
    const listRef = ref(firebaseDb, path);
    const unsubscribe = onValue(listRef, snapshot => {
      if (!snapshot.val() && indices?.length !== 0) {
        // this happens for empty array, such as tumors for a new mutation
        setIndices([]);
        return;
      }

      if (!indices) {
        const items = snapshot.val();
        const itemsWithIndices = items.map((item, index) => ({ ...item, index }));
        setIndices(
          defaultSort
            ? itemsWithIndices
                .sort((a, b) => {
                  const { aIndex, ...aWithoutIndex } = a;
                  const { bIndex, ...bWithoutIndex } = b;
                  return defaultSort(aWithoutIndex, bWithoutIndex);
                })
                .map(item => item.index)
            : itemsWithIndices.map(item => item.index)
        );
      } else if (snapshot.size !== indices.length + numItemsAdded) {
        setNumItemsAdded(snapshot.size - indices.length);
      }
    });

    return () => unsubscribe?.();
  }, [path, firebaseDb, indices, numItemsAdded, setNumItemsAdded]);

  const listItems = useMemo(() => {
    if (!indices) {
      return [];
    }

    const items: { item: JSX.Element; index: number }[] = [];

    const addedItemIndices: number[] = [];
    for (let i = 0; i < numItemsAdded; i++) {
      addedItemIndices.push(i + indices.length);
    }

    let allItemIndices: number[];
    if (pushDirection === 'front') {
      allItemIndices = [...addedItemIndices.reverse(), ...indices];
    } else if (pushDirection === 'back') {
      allItemIndices = [...indices, ...addedItemIndices];
    }

    for (const index of allItemIndices) {
      items.push({ item: <div key={index}>{itemBuilder(index)}</div>, index }); // is using index as key ok? I think it might since firebase order not chagning
    }
    return items;
  }, [indices, numItemsAdded, path]);

  function getList() {
    if (!filter) {
      return listItems.map(item => item.item);
    }
    return listItems.reduce<JSX.Element[]>((accumulator, item) => {
      if (filter(item.index)) {
        return [...accumulator, item.item];
      }
      return accumulator;
    }, []);
  }

  const list = getList();

  if (scrollOptions) {
    return (
      <div
        ref={viewportRef => {
          const viewportHeight = viewportRef?.clientHeight;
          if (!_.isNil(viewportHeight) && initialRenderComplete && viewportHeight < scrollOptions.viewportHeight) {
            setInitialLoad(true);
          }
        }}
        style={{ maxHeight: scrollOptions.viewportHeight, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <InfiniteScroll
          initialLoad={initialLoad}
          loadMore={() => {
            setMaxItemsRendered(num => num + scrollOptions.renderCount);
          }}
          hasMore={maxItemsRendered < list.length}
          useWindow={false}
        >
          {list.slice(0, maxItemsRendered)}
        </InfiniteScroll>
      </div>
    );
  }
  return <>{list}</>;
}

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(FirebaseList));
