import { notNullOrUndefined } from 'app/shared/util/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { ParsedHistoryRecord } from './CurationPage';
import FirebaseList from './FirebaseList';
import MutationCollapsible from './MutationCollapsible';
import MutationName from './MutationName';
import MutationsFilterSection from './MutationsFilterSection';
import AddMutationButton from '../curation/button/AddMutationButton';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import AddMutationModal from 'app/shared/modal/AddMutationModal';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';

export interface IMutationsSectionProps extends StoreProps {
  mutationsPath: string;
  hugoSymbol: string;
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
}

function MutationsSection({ mutationsPath, hugoSymbol, parsedHistoryList, updateMutations }: IMutationsSectionProps) {
  const [showAddMutationModal, setShowAddMutationModal] = useState(false);
  const [filteredIndices, setFilteredIndices] = useState<number[]>([]);
  const [openMutationCollapsibleIndex, setOpenMutationCollapsibleIndex] = useState<number>(null);

  const mutationScrollContainerRef = useRef<HTMLDivElement>(null);

  const handleMutationListLengthChange = useCallback(
    (oldLength: number, newLength: number) => {
      if (notNullOrUndefined(openMutationCollapsibleIndex)) {
        setOpenMutationCollapsibleIndex(index => {
          return index + newLength - oldLength;
        });
      }
    },
    [openMutationCollapsibleIndex, setOpenMutationCollapsibleIndex]
  );

  function getMutationCollapsibles() {
    return (
      <>
        {notNullOrUndefined(openMutationCollapsibleIndex) && (
          <div style={{ transition: 'height 0.5s, opacity 0.5s' }} className={'mb-2'}>
            <div>
              <MutationCollapsible
                open
                mutationPath={`${mutationsPath}/${openMutationCollapsibleIndex}`}
                hugoSymbol={hugoSymbol}
                parsedHistoryList={parsedHistoryList}
                onToggle={() => {
                  setOpenMutationCollapsibleIndex(null);
                }}
              />
            </div>
          </div>
        )}
        <div
          style={{
            visibility: notNullOrUndefined(openMutationCollapsibleIndex) ? 'hidden' : 'visible',
            maxHeight: notNullOrUndefined(openMutationCollapsibleIndex) ? '0px' : null,
          }}
        >
          <div style={{ maxHeight: '1000px', overflowY: 'auto', overflowX: 'hidden' }} ref={mutationScrollContainerRef}>
            <FirebaseList
              path={mutationsPath}
              itemBuilder={index => {
                return (
                  <MutationCollapsible
                    disableOpen
                    mutationPath={`${mutationsPath}/${index}`}
                    hugoSymbol={hugoSymbol}
                    parsedHistoryList={parsedHistoryList}
                    onToggle={() => {
                      setOpenMutationCollapsibleIndex(index);
                    }}
                  />
                );
              }}
              filter={index => {
                return !filteredIndices.includes(index);
              }}
              onLengthChange={handleMutationListLengthChange}
              viewportRef={mutationScrollContainerRef}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-5">
        <Row
          className="mb-4"
          style={{
            visibility: notNullOrUndefined(openMutationCollapsibleIndex) ? 'visible' : 'hidden',
            maxHeight: notNullOrUndefined(openMutationCollapsibleIndex) ? null : '0px',
          }}
        >
          <Col>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span onClick={() => setOpenMutationCollapsibleIndex(null)}>Mutations</span>
              <span className="px-2" style={{ color: '#6c757d' }}>
                /
              </span>
              <MutationName mutationPath={`${mutationsPath}/${openMutationCollapsibleIndex}`} />
            </div>
          </Col>
        </Row>
        <Row
          style={{
            visibility: notNullOrUndefined(openMutationCollapsibleIndex) ? 'hidden' : 'visible',
            maxHeight: notNullOrUndefined(openMutationCollapsibleIndex) ? '0px' : null,
          }}
        >
          <Col>
            <div className={'d-flex justify-content-between align-items-center mb-2'}>
              <div className="mb-2 d-flex align-items-center">
                <h5 className="mb-0 mr-2">Mutations:</h5>{' '}
                <AddMutationButton
                  showAddMutationModal={showAddMutationModal}
                  onClickHandler={(show: boolean) => setShowAddMutationModal(!show)}
                />
                {/* {mutationsAreFiltered && (
                <span>{`Showing ${mutations.length} of ${props.data.mutations.length} matching the search`}</span>
              )} */}
              </div>
              <MutationsFilterSection
                mutationsPath={mutationsPath}
                filteredIndices={filteredIndices}
                setFilteredIndices={setFilteredIndices}
              />
            </div>
          </Col>
        </Row>
        {getMutationCollapsibles()}
      </div>
      {showAddMutationModal && (
        <AddMutationModal
          hugoSymbol={hugoSymbol}
          onConfirm={async newMutation => {
            try {
              await updateMutations(mutationsPath, [newMutation]);
            } catch (error) {
              notifyError(error);
            }
            setShowAddMutationModal(show => !show);
          }}
          onCancel={() => {
            setShowAddMutationModal(show => !show);
          }}
        />
      )}
    </>
  );
}

const mapStoreToProps = ({ firebaseCrudStore }: IRootStore) => ({
  updateMutations: firebaseCrudStore.pushToArrayFront,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationsSection));
