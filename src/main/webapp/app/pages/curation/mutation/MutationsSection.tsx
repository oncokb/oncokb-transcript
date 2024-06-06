import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import { Mutation } from 'app/shared/model/firebase/firebase.model';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import {
  compareMutationsByLastModified,
  compareMutationsByProteinChangePosition,
  compareMutationsDefault,
  getFirebaseGenePath,
  getMutationName,
} from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import classNames from 'classnames';
import { onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import MutationCollapsible from '../collapsible/MutationCollapsible';
import MutationsSectionHeader, { SortOptions } from '../header/MutationsSectionHeader';
import FirebaseList from '../list/FirebaseList';
import * as styles from '../styles.module.scss';
import MutationName from './MutationName';

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
  openMutationCollapsibleIndex,
  setOpenMutationCollapsibleIndex,
  onMutationListRender,
  firebaseDb,
  annotatedAltsCache,
  fetchMutationListForConvertIcon,
}: IMutationsSectionProps) {
  const [showAddMutationModal, setShowAddMutationModal] = useState(false);
  const [filteredIndices, setFilteredIndices] = useState<number[]>([]);
  const [sortMethod, setSortMethod] = useState<SortOptions>(SortOptions.DEFAULT);

  const mutationSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMutationListForConvertIcon(mutationsPath);
  }, []);

  useEffect(() => {
    onValue(
      ref(firebaseDb, `${getFirebaseGenePath(isGermline, hugoSymbol)}/mutations`),
      snapshot => {
        annotatedAltsCache.fetch(
          hugoSymbol,
          (snapshot.val() || []).map((mut: Mutation) => {
            return {
              name: mut.name,
              alterations: mut.alterations,
            };
          }),
        );
      },
      { onlyOnce: true },
    );
  }, [hugoSymbol, isGermline]);

  function getMutationCollapsibles() {
    return (
      <>
        {!_.isNil(openMutationCollapsibleIndex) && (
          // though a greater minHeight would reduce blinking more, need to choose a minHeight that looks good on the smallest possible mutation
          <div style={{ transition: 'height 0.5s, opacity 0.5s', minHeight: 400 }} className={'mb-2'}>
            <MutationCollapsible
              open
              mutationPath={`${mutationsPath}/${openMutationCollapsibleIndex}`}
              hugoSymbol={hugoSymbol}
              isGermline={isGermline}
              parsedHistoryList={parsedHistoryList}
              onToggle={() => {
                setOpenMutationCollapsibleIndex(null);
              }}
            />
          </div>
        )}
        <div
          style={{
            visibility: !_.isNil(openMutationCollapsibleIndex) ? 'hidden' : 'inherit',
            maxHeight: !_.isNil(openMutationCollapsibleIndex) ? '0px' : null,
          }}
        >
          <FirebaseList<Mutation>
            path={mutationsPath}
            pushDirection="front"
            sort={getSortFunction}
            itemBuilder={index => {
              return (
                <div className="mb-2">
                  <MutationCollapsible
                    disableOpen
                    mutationPath={`${mutationsPath}/${index}`}
                    showLastModified={sortMethod === SortOptions.LAST_MODIFIED}
                    hugoSymbol={hugoSymbol}
                    isGermline={isGermline}
                    parsedHistoryList={parsedHistoryList}
                    onToggle={() => {
                      setOpenMutationCollapsibleIndex(index);
                      if (mutationSectionRef.current.getBoundingClientRect().top < 0) {
                        mutationSectionRef.current.scrollIntoView();
                      }
                    }}
                  />
                </div>
              );
            }}
            filter={index => {
              return filteredIndices.includes(index);
            }}
            onInitialRender={onMutationListRender}
            scrollOptions={{ viewportHeight: 1000, renderCount: 200 }}
          />
        </div>
      </>
    );
  }

  function getSortFunction(mutation1: Mutation, mutation2: Mutation) {
    let order: number;

    switch (sortMethod) {
      case SortOptions.DEFAULT:
        return compareMutationsDefault(mutation1, mutation2);
      case SortOptions.LAST_MODIFIED:
        return compareMutationsByLastModified(mutation1, mutation2);
      case SortOptions.POSITION_INCREASING:
        order = compareMutationsByProteinChangePosition(mutation1, mutation2);
        if (order === 0) {
          order = getMutationName(mutation1.name, mutation1.alterations).localeCompare(
            getMutationName(mutation2.name, mutation2.alterations),
          );
        }
        return order;
      case SortOptions.POSITION_DECREASING:
        return;
      default:
        return;
    }
  }

  return (
    <>
      <div ref={mutationSectionRef}>
        <Row
          className={classNames(!_.isNil(openMutationCollapsibleIndex) ? 'mb-4' : null)}
          style={{
            visibility: !_.isNil(openMutationCollapsibleIndex) ? 'visible' : 'hidden',
            maxHeight: !_.isNil(openMutationCollapsibleIndex) ? null : '0px',
          }}
        >
          <Col>
            <div className="mt-4" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span className={styles.link} onClick={() => setOpenMutationCollapsibleIndex(null)}>
                Mutations
              </span>
              <span className="px-2" style={{ color: '#6c757d' }}>
                /
              </span>
              <MutationName mutationPath={`${mutationsPath}/${openMutationCollapsibleIndex}`} />
            </div>
          </Col>
        </Row>
        <Row
          style={{
            visibility: !_.isNil(openMutationCollapsibleIndex) ? 'hidden' : 'inherit',
            maxHeight: !_.isNil(openMutationCollapsibleIndex) ? '0px' : null,
          }}
        >
          <Col>
            <MutationsSectionHeader
              hugoSymbol={hugoSymbol}
              mutationsPath={mutationsPath}
              metaGeneReviewPath={metaGeneReviewPath}
              filteredIndices={filteredIndices}
              setFilteredIndices={setFilteredIndices}
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
          onConfirm={async (newMutation, newMutationIndex) => {
            try {
              await addMutation(mutationsPath, newMutation);
              setShowAddMutationModal(show => !show);
              setOpenMutationCollapsibleIndex(newMutationIndex);
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
  openMutationCollapsibleIndex: openMutationCollapsibleStore.index,
  setOpenMutationCollapsibleIndex: openMutationCollapsibleStore.setOpenMutationCollapsibleIndex,
  firebaseDb: firebaseAppStore.firebaseDb,
  annotatedAltsCache: curationPageStore.annotatedAltsCache,
  fetchMutationListForConvertIcon: firebaseMutationConvertIconStore.fetchData,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationsSection));
