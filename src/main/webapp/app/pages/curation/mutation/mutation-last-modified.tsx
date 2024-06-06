import { APP_DATETIME_FORMAT } from 'app/config/constants/constants';
import { getMutationModifiedTimestamp } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { TextFormat } from 'react-jhipster';

export interface IMutationLastModifedProps extends StoreProps {
  mutationUuid: string;
  className?: string;
}

export function MutationLastModified({ mutationUuid, mutationList, className }: IMutationLastModifedProps) {
  const [lastModified, setLastModified] = useState<number>(null);

  useEffect(() => {
    if (mutationList && _.isNil(lastModified)) {
      setLastModified(getMutationModifiedTimestamp(mutationList.find(mutation => mutation.name_uuid === mutationUuid)));
    }
  }, [mutationUuid, mutationList, lastModified]);

  return !_.isNil(lastModified) ? (
    <span className={className}>
      <i>
        Last modifed: <TextFormat value={lastModified} type="date" format={APP_DATETIME_FORMAT} />
      </i>
    </span>
  ) : (
    <></>
  );
}

const mapStoreToProps = ({ firebaseMutationListStore }: IRootStore) => ({
  mutationList: firebaseMutationListStore.data,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationLastModified));
