import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import { Mutation, MutationList } from 'app/shared/model/firebase/firebase.model';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import {
  compareMutationsByLastModified,
  compareMutationsByName,
  compareMutationsByProteinChangePosition,
  compareMutationsDefault,
  getFirebaseGenePath,
} from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import classNames from 'classnames';
import { onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import MutationCollapsible from '../collapsible/MutationCollapsible';
import MutationsSectionHeader, { SortOptions } from '../header/MutationsSectionHeader';
import FirebaseList from '../list/FirebaseList';
import * as styles from '../styles.module.scss';
import MutationName from './MutationName';
import { extractPositionFromSingleNucleotideAlteration } from 'app/shared/util/utils';
import { MUTATION_LIST_ID, SINGLE_MUTATION_VIEW_ID } from 'app/config/constants/html-id';
import { SentryError } from 'app/config/sentry-error';
import { MutationQuery } from 'app/stores/curation-page.store';

export interface IMutationsSectionProps extends StoreProps {
  mutationsPath: string;
  metaGeneReviewPath: string;
  hugoSymbol: string;
  isGermline: boolean;
  parsedHistoryList: Map<string, FlattenedHistory[]>;
  onMutationListRender: () => void;
}

function MutationsSection({
  mutationsPath,
  metaGeneReviewPath,
  hugoSymbol,
  isGermline,
  parsedHistoryList,
  addMutation,
  openMutationCollapsibleListKey,
  setOpenMutationCollapsibleListKey,
  onMutationListRender,
  firebaseDb,
  annotatedAltsCache,
  fetchMutationListForConvertIcon,
}: IMutationsSectionProps) {
  const [showAddMutationModal, setShowAddMutationModal] = useState(false);
  const [filteredMutationKeys, setFilteredMutationKeys] = useState<string[]>([]);
  const [sortMethod, setSortMethod] = useState<SortOptions>(SortOptions.DEFAULT);

  const mutationSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMutationListForConvertIcon?.(mutationsPath);
  }, []);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    onValue(
      ref(firebaseDb, `${getFirebaseGenePath(isGermline, hugoSymbol)}/mutations`),
      snapshot => {
        const mutationList: MutationList | null = snapshot.val();
        const mutationQueries = Object.values(mutationList ?? {}).map(
          (mut: Mutation): MutationQuery => ({
            name: mut.name,
            alterations: mut.alterations ?? null,
          }),
        );
        annotatedAltsCache?.fetch(hugoSymbol, mutationQueries);
      },
      { onlyOnce: true },
    );
  }, [hugoSymbol, isGermline]);

  function getMutationCollapsibles() {
    return (
      <>
        {!_.isNil(openMutationCollapsibleListKey) && (
          // though a greater minHeight would reduce blinking more, need to choose a minHeight that looks good on the smallest possible mutation
          <div style={{ transition: 'height 0.5s, opacity 0.5s', minHeight: 400 }} className={'mb-2'} data-testid={SINGLE_MUTATION_VIEW_ID}>
            <MutationCollapsible
              open
              mutationPath={`${mutationsPath}/${openMutationCollapsibleListKey}`}
              hugoSymbol={hugoSymbol}
              isGermline={isGermline}
              parsedHistoryList={parsedHistoryList}
              onToggle={() => {
                setOpenMutationCollapsibleListKey?.(null);
              }}
            />
          </div>
        )}
        <div
          style={{
            visibility: !_.isNil(openMutationCollapsibleListKey) ? 'hidden' : 'inherit',
            maxHeight: !_.isNil(openMutationCollapsibleListKey) ? '0px' : undefined,
          }}
          data-testid={MUTATION_LIST_ID}
        >
          <FirebaseList<Mutation>
            path={mutationsPath}
            pushDirection="front"
            sort={getSortFunction}
            itemBuilder={itemBuilder}
            filter={listKey => {
              return filteredMutationKeys.includes(listKey);
            }}
            onInitialRender={onMutationListRender}
            scrollOptions={{ viewportHeight: 1000, renderCount: 200 }}
          />
        </div>
      </>
    );
  }

  const getSortFunction = useCallback(
    (mutation1: Mutation, mutation2: Mutation) => {
      let order: number;
      let mutation1IsProteinChange: boolean;
      let mutation2IsProteinChange: boolean;

      switch (sortMethod) {
        case SortOptions.DEFAULT:
          return compareMutationsDefault(mutation1, mutation2);
        case SortOptions.LAST_MODIFIED:
          return compareMutationsByLastModified(mutation1, mutation2);
        case SortOptions.POSITION_INCREASING:
          order = compareMutationsByProteinChangePosition(mutation1, mutation2);
          return order === 0 ? compareMutationsByName(mutation1, mutation2) : order;
        case SortOptions.POSITION_DECREASING:
          mutation1IsProteinChange = !_.isNil(extractPositionFromSingleNucleotideAlteration(mutation1.name));
          mutation2IsProteinChange = !_.isNil(extractPositionFromSingleNucleotideAlteration(mutation2.name));
          if (mutation1IsProteinChange && mutation2IsProteinChange) {
            return compareMutationsByProteinChangePosition(mutation1, mutation2) * -1;
          } else if (!mutation1IsProteinChange && !mutation2IsProteinChange) {
            return compareMutationsByName(mutation1, mutation2);
          }
          return compareMutationsByProteinChangePosition(mutation1, mutation2);
        default:
          return 0;
      }
    },
    [sortMethod],
  );

  const itemBuilder = useCallback(
    (itemKey: string) => {
      return (
        <div className="mb-2">
          <MutationCollapsible
            disableOpen
            mutationPath={`${mutationsPath}/${itemKey}`}
            showLastModified={sortMethod === SortOptions.LAST_MODIFIED}
            hugoSymbol={hugoSymbol}
            isGermline={isGermline}
            parsedHistoryList={parsedHistoryList}
            onToggle={() => {
              setOpenMutationCollapsibleListKey?.(itemKey);
              if (mutationSectionRef.current !== null && mutationSectionRef.current.getBoundingClientRect().top < 0) {
                mutationSectionRef.current.scrollIntoView();
              }
            }}
          />
        </div>
      );
    },
    [mutationsPath, sortMethod, hugoSymbol, isGermline, parsedHistoryList, setOpenMutationCollapsibleListKey],
  );

  return (
    <>
      <div ref={mutationSectionRef}>
        <Row
          className={classNames(!_.isNil(openMutationCollapsibleListKey) ? 'mb-4' : null)}
          style={{
            visibility: !_.isNil(openMutationCollapsibleListKey) ? 'visible' : 'hidden',
            maxHeight: !_.isNil(openMutationCollapsibleListKey) ? undefined : '0px',
          }}
        >
          <Col>
            <div className="mt-4" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span className={styles.link} onClick={() => setOpenMutationCollapsibleListKey?.(null)}>
                Mutations
              </span>
              <span className="px-2" style={{ color: '#6c757d' }}>
                /
              </span>
              <MutationName mutationPath={`${mutationsPath}/${openMutationCollapsibleListKey}`} />
            </div>
          </Col>
        </Row>
        <Row
          style={{
            visibility: !_.isNil(openMutationCollapsibleListKey) ? 'hidden' : 'inherit',
            maxHeight: !_.isNil(openMutationCollapsibleListKey) ? '0px' : undefined,
          }}
        >
          <Col>
            <MutationsSectionHeader
              hugoSymbol={hugoSymbol}
              mutationsPath={mutationsPath}
              metaGeneReviewPath={metaGeneReviewPath}
              filteredMutationKeys={filteredMutationKeys}
              setFilteredMutationKeys={setFilteredMutationKeys}
              showAddMutationModal={showAddMutationModal}
              setShowAddMutationModal={setShowAddMutationModal}
              setSortMethod={setSortMethod}
            />
          </Col>
        </Row>
        {getMutationCollapsibles()}
      </div>
      {showAddMutationModal && (
        <AddMutationModal
          hugoSymbol={hugoSymbol}
          isGermline={isGermline}
          onConfirm={async newMutation => {
            try {
              const addMutationResult = await addMutation?.(mutationsPath, newMutation, isGermline);
              if (addMutationResult === undefined) {
                throw new SentryError('Failed to add mutation', { newMutation, mutationsPath, isGermline });
              }
              setShowAddMutationModal(show => !show);
              setOpenMutationCollapsibleListKey?.(addMutationResult);
            } catch (error) {
              notifyError(error);
            }
          }}
          onCancel={() => {
            setShowAddMutationModal(show => !show);
          }}
        />
      )}
    </>
  );
}

const mapStoreToProps = ({
  firebaseGeneService,
  openMutationCollapsibleStore,
  firebaseAppStore,
  curationPageStore,
  firebaseMutationConvertIconStore,
}: IRootStore) => ({
  addMutation: firebaseGeneService.addMutation,
  openMutationCollapsibleListKey: openMutationCollapsibleStore.listKey,
  setOpenMutationCollapsibleListKey: openMutationCollapsibleStore.setOpenMutationCollapsibleListKey,
  firebaseDb: firebaseAppStore.firebaseDb,
  annotatedAltsCache: curationPageStore.annotatedAltsCache,
  fetchMutationListForConvertIcon: firebaseMutationConvertIconStore.fetchData,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationsSection));
