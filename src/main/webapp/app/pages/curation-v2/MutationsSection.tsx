import { notNullOrUndefined } from 'app/shared/util/utils';
import React, { useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { ParsedHistoryRecord } from './CurationPage';
import FirebaseList from './FirebaseList';
import MutationCollapsible from './MutationCollapsible';
import MutationName from './MutationName';
import MutationsFilterSection from './MutationsFilterSection';

export interface IMutationsSectionProps {
  mutationsPath: string;
  hugoSymbol: string;
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
}

export default function MutationsSection({ mutationsPath, hugoSymbol, parsedHistoryList }: IMutationsSectionProps) {
  const [filteredIndices, setFilteredIndices] = useState<number[]>([]);
  const [openMutationCollapsibleIndex, setOpenMutationCollapsibleIndex] = useState<number>(null);

  const mutationScrollContainerRef = useRef<HTMLDivElement>(null);

  function getMutationCollapsibles() {
    if (notNullOrUndefined(openMutationCollapsibleIndex)) {
      return (
        <Row style={{ transition: 'height 0.5s, opacity 0.5s' }} className={'mb-2'}>
          <Col>
            <MutationCollapsible
              open
              mutationPath={`${mutationsPath}/${openMutationCollapsibleIndex}`}
              hugoSymbol={hugoSymbol}
              parsedHistoryList={parsedHistoryList}
              onToggle={() => {
                setOpenMutationCollapsibleIndex(null);
              }}
            />
          </Col>
        </Row>
      );
    }

    return (
      <div style={{ maxHeight: '550px', overflowY: 'auto', overflowX: 'hidden' }} ref={mutationScrollContainerRef}>
        <FirebaseList
          path={mutationsPath}
          itemBuilder={index => {
            return (
              <MutationCollapsible
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
          viewportRef={mutationScrollContainerRef}
        />
      </div>
    );
  }

  return (
    <div className="mb-5">
      {notNullOrUndefined(openMutationCollapsibleIndex) ? (
        <Row className="mb-4">
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
      ) : (
        <Row>
          <Col>
            <div className={'d-flex justify-content-between align-items-center mb-2'}>
              <div className="mb-2 d-flex align-items-center">
                <h5 className="mb-0 mr-2">Mutations:</h5>{' '}
                {/* <AddMutationButton
                showAddMutationModal={showAddMutationModal}
                onClickHandler={(show: boolean) => setShowAddMutationModal(!show)}
              /> */}
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
      )}
      {getMutationCollapsibles()}
    </div>
  );
}
