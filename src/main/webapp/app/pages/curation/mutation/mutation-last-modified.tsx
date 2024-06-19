import { APP_DATETIME_FORMAT } from 'app/config/constants/constants';
import { getMutationModifiedTimestamp } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { TextFormat } from 'react-jhipster';
import * as Sentry from '@sentry/react';
import { notifySentryException } from 'app/config/sentry-error';
import { GREY } from 'app/config/colors';
import classNames from 'classnames';

export interface IMutationLastModifedProps extends StoreProps {
  mutationUuid: string;

  // just for error info
  hugoSymbol: string;
  isGermline: boolean;

  className?: string;
}

export function MutationLastModified({ mutationUuid, mutationList, hugoSymbol, isGermline, className }: IMutationLastModifedProps) {
  const [lastModified, setLastModified] = useState<number>(null);

  useEffect(() => {
    if (mutationList && _.isNil(lastModified)) {
      const mutation = mutationList.find(mut => mut.name_uuid === mutationUuid);
      const timestamp = getMutationModifiedTimestamp(mutation);
      setLastModified(timestamp);

      if (isNaN(timestamp)) {
        notifySentryException('Invalid date encountered when trying to show mutation last modified time', {
          hugoSymbol,
          mutation,
          isGermline,
        });
      }
    }
  }, [mutationUuid, mutationList, lastModified]);

  return !_.isNil(lastModified) && !isNaN(lastModified) ? (
    <span className={classNames('d-flex align-items-center', className)} style={{ fontSize: '0.75rem', color: GREY }}>
      Last modified: <TextFormat value={lastModified} type="date" format={APP_DATETIME_FORMAT} />
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
