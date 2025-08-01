import React, { useEffect, useMemo, useRef, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { get, onValue, ref } from 'firebase/database';
import InfiniteScroll from '@larryyangsen/react-infinite-scroller';
import _ from 'lodash';

export interface IFirebaseListProps<T> extends StoreProps {
  path: string;
  itemBuilder: (firebaseListKey: string) => React.ReactNode;
  pushDirection: 'front' | 'back';
  scrollOptions?: {
    viewportHeight: number;
    renderCount: number;
  };
  filter?: (firebaseListKey: string) => boolean;
  sort?: (a: T, b: T) => number;
  onRender?: () => void;
}

function FirebaseList<T>({ path, itemBuilder, pushDirection, scrollOptions, filter, sort, onRender, firebaseDb }: IFirebaseListProps<T>) {
  const [listItemKeys, setListItemKeys] = useState<string[] | null>(null); // Track the order in which the array keys should be presented
  const [addedListItemKeys, setAddedListItemKeys] = useState<string[]>([]);

  // Only used when scrollOptions is set
  const [maxItemsRendered, setMaxItemsRendered] = useState(scrollOptions?.renderCount);
  const [initialLoad, setInitialLoad] = useState(false);

  useEffect(() => {
    return () => {
      setListItemKeys(null);
      setAddedListItemKeys([]);
    };
  }, [path]);

  useEffect(() => {
    // https://webperf.tips/tip/measuring-paint-time/
    if (!onRender || !listItemKeys) {
      return;
    }

    requestAnimationFrame(() => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = () => {
        onRender();
      };
      messageChannel.port2.postMessage(undefined);
    });
  }, [listItemKeys]);

  useEffect(() => {
    // Adding a listener to mutation list will cause re-render if any fields (no matter nest level) are updated.
    // We only want to re-render when the length of the list has changed
    if (!firebaseDb) {
      return;
    }
    const listRef = ref(firebaseDb, path);
    const unsubscribe = onValue(listRef, snapshot => {
      if (!snapshot.val() || !listItemKeys) {
        return;
      }
      const currentKeys = Object.keys(snapshot.val() as Record<string, T>);
      const newKeys = currentKeys.filter(x => !listItemKeys.includes(x));

      // Only update if newKeys differ from addedListItemKeys
      const sameLength = newKeys.length === addedListItemKeys.length;
      const sameContent = sameLength && newKeys.every(x => addedListItemKeys.includes(x));
      if (!sameContent) {
        setAddedListItemKeys(newKeys);
      }
    });

    return () => unsubscribe?.();
  }, [path, firebaseDb, listItemKeys, addedListItemKeys, setAddedListItemKeys]);

  useEffect(() => {
    async function getItems() {
      if (!firebaseDb) {
        return;
      }
      const items = (await get(ref(firebaseDb, path))).val() as Record<string, T>;
      if (!items && listItemKeys?.length !== 0) {
        setListItemKeys([]);
        return;
      }

      // Get a list of ordered array keys
      const itemKeyValueArray = Object.entries(items ?? {});
      if (sort) {
        itemKeyValueArray.sort(([aKey, aItem], [bKey, bItem]) => {
          return sort(aItem, bItem);
        });
      }
      setListItemKeys(itemKeyValueArray.map(([itemKey, item]) => itemKey));
    }

    getItems();
  }, [path, firebaseDb, sort]);

  const listItems = useMemo(() => {
    if (!listItemKeys) {
      return [];
    }

    const items: { item: JSX.Element; itemKey: string }[] = [];

    let allItemKeys: string[] = [];
    if (pushDirection === 'front') {
      allItemKeys = [...addedListItemKeys.reverse(), ...listItemKeys];
    } else if (pushDirection === 'back') {
      allItemKeys = [...listItemKeys, ...addedListItemKeys];
    }

    for (const k of allItemKeys) {
      items.push({ item: <div key={k}>{itemBuilder(k)}</div>, itemKey: k });
    }

    return items;
  }, [listItemKeys, addedListItemKeys, path, itemBuilder]);

  function getList() {
    if (!filter) {
      return listItems.map(item => item.item);
    }
    return listItems.reduce<JSX.Element[]>((accumulator, item) => {
      if (filter(item.itemKey)) {
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
          if (!_.isNil(viewportHeight) && viewportHeight < scrollOptions.viewportHeight) {
            setInitialLoad(true);
          }
        }}
        style={{ maxHeight: scrollOptions.viewportHeight, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <InfiniteScroll
          initialLoad={initialLoad}
          loadMore={() => {
            setMaxItemsRendered(num => (num ?? 0) + scrollOptions.renderCount);
          }}
          hasMore={!!maxItemsRendered && maxItemsRendered < list.length}
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
