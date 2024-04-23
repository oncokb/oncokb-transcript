import React, { useEffect, useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import FirebaseList from '../list/FirebaseList';
import MutationName from './MutationName';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { Mutation } from 'app/shared/model/firebase/firebase.model';
import { compareMutations, getFirebaseGenePath } from 'app/shared/util/firebase/firebase-utils';
import MutationCollapsible from '../collapsible/MutationCollapsible';
import styles from '../styles.module.scss';
import MutationsSectionHeader from '../header/MutationsSectionHeader';
import classNames from 'classnames';
import _ from 'lodash';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import { onValue, ref } from 'firebase/database';

export interface IMutationsSectionProps extends StoreProps {
  mutationsPath: string;
  hugoSymbol: string;
  isGermline: boolean;
  parsedHistoryList: Map<string, FlattenedHistory[]>;
  onMutationListRender: () => void;
}

function MutationsSection({
  mutationsPath,
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

  const mutationSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetchMutationListForConvertIcon(mutationsPath);
  }, []);

  useEffect(() => {
    onValue(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ref(firebaseDb, `${getFirebaseGenePath(isGermline, hugoSymbol)}/mutations`),
      snapshot => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        annotatedAltsCache.fetch(
          hugoSymbol,
          snapshot.val().map((mut: Mutation) => {
            return {
              name: mut.name,
              alterations: mut.alterations,
            };
          })
        );
      },
      { onlyOnce: true }
    );
  }, [hugoSymbol, isGermline]);

  function getMutationCollapsibles() {
    return (
      <>
        {!_.isNil(openMutationCollapsibleIndex) && (
          <div style={{ transition: 'height 0.5s, opacity 0.5s' }} className={'mb-2'}>
            <div>
              <MutationCollapsible
                open
                mutationPath={`${mutationsPath}/${openMutationCollapsibleIndex}`}
                hugoSymbol={hugoSymbol}
                isGermline={isGermline}
                parsedHistoryList={parsedHistoryList}
                onToggle={() => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  setOpenMutationCollapsibleIndex(null);
                }}
              />
            </div>
          </div>
        )}
        <div
          style={{
            visibility: !_.isNil(openMutationCollapsibleIndex) ? 'hidden' : 'inherit',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            maxHeight: !_.isNil(openMutationCollapsibleIndex) ? '0px' : null,
          }}
        >
          <FirebaseList<Mutation>
            path={mutationsPath}
            pushDirection="front"
            defaultSort={compareMutations}
            itemBuilder={index => {
              return (
                <div className="mb-2">
                  <MutationCollapsible
                    disableOpen
                    mutationPath={`${mutationsPath}/${index}`}
                    hugoSymbol={hugoSymbol}
                    isGermline={isGermline}
                    parsedHistoryList={parsedHistoryList}
                    onToggle={() => {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      setOpenMutationCollapsibleIndex(index);
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      if (mutationSectionRef.current.getBoundingClientRect().top < 0) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
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

  return (
    <>
      <div ref={mutationSectionRef}>
        <Row
          className={classNames(!_.isNil(openMutationCollapsibleIndex) ? 'mb-4' : null)}
          style={{
            visibility: !_.isNil(openMutationCollapsibleIndex) ? 'visible' : 'hidden',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            maxHeight: !_.isNil(openMutationCollapsibleIndex) ? null : '0px',
          }}
        >
          <Col>
            <div className="mt-4" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span
                className={styles.link}
                onClick={
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  () => setOpenMutationCollapsibleIndex(null)
                }
              >
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            maxHeight: !_.isNil(openMutationCollapsibleIndex) ? '0px' : null,
          }}
        >
          <Col>
            <MutationsSectionHeader
              hugoSymbol={hugoSymbol}
              mutationsPath={mutationsPath}
              filteredIndices={filteredIndices}
              setFilteredIndices={setFilteredIndices}
              showAddMutationModal={showAddMutationModal}
              setShowAddMutationModal={setShowAddMutationModal}
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
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              await addMutation(mutationsPath, newMutation);
              setShowAddMutationModal(show => !show);
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
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
