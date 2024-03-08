import React, { useEffect, useState } from 'react';
import { SimpleConfirmModal } from './SimpleConfirmModal';
import { Alert, Button, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';
import { cancerTypeClient } from '../api/clients';
import OncoKBTable, { SearchColumn } from '../table/OncoKBTable';
import ActionIcon from '../icons/ActionIcon';
import { DANGER, ONCOKB_BLUE } from 'app/config/colors';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import classNames from 'classnames';
import { CellInfo } from 'react-table';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import DefaultBadge from '../badge/DefaultBadge';
import { CancerType } from '../model/firebase/firebase.model';
import { RelevantCancerType } from './relevant-cancer-types-modal-store';
import { CancerType as FetchedCancerType, RelevantCancerTypeQuery } from '../api/generated';
import { FaExclamationCircle } from 'react-icons/fa';
import InfoIcon from '../icons/InfoIcon';

export interface IRelevantCancerTypesModalProps extends StoreProps {
  onConfirm: (newRelevantCancerTypes: CancerType[], noneDeleted: boolean) => void;
  onCancel: () => void;
}

const RelevantCancerTypesModal = observer((props: IRelevantCancerTypesModalProps) => {
  return props.relevantCancerTypesModalStore.isOpen ? <RelevantCancerTypesModalContent {...props} /> : <></>;
});

const RelevantCancerTypesModalContent = observer(
  ({ relevantCancerTypesModalStore, onConfirm, onCancel }: IRelevantCancerTypesModalProps) => {
    const [showWarning, setShowWarning] = useState(true);

    const allCancerTypesDeleted =
      relevantCancerTypesModalStore.relevantCancerTypes.length > 0 &&
      relevantCancerTypesModalStore.relevantCancerTypes.every(rct => rct.isDeleted);

    useEffect(() => {
      function convertFetchedCancerTypeToRelevantCancerType(cancerType: FetchedCancerType, isDeleted: boolean) {
        const newRct = new RelevantCancerType();
        newRct.mainType = cancerType.mainType;
        newRct.subtype = cancerType.subtype;
        newRct.code = cancerType.code;
        newRct.isDeleted = isDeleted;
        newRct.level = cancerType.level;
        return newRct;
      }

      function convertCancerTypesToRelevantCancerTypeQueries(cancerTypes: CancerType[]) {
        return (
          cancerTypes?.map(type => ({
            mainType: type.mainType,
            code: type.code,
          })) || []
        );
      }

      async function setRelevantCancerTypes() {
        const relevantCancerTypeQueries: RelevantCancerTypeQuery[] = convertCancerTypesToRelevantCancerTypeQueries(
          relevantCancerTypesModalStore.tumor.cancerTypes
        );
        const excludedRelevantCancerTypeQueries: RelevantCancerTypeQuery[] = convertCancerTypesToRelevantCancerTypeQueries(
          relevantCancerTypesModalStore.tumor.excludedCancerTypes
        );

        const fetchedRelevantCancerTypes = (
          await cancerTypeClient.getRelevantCancerTypes(
            { relevantCancerTypeQueries, excludedRelevantCancerTypeQueries },
            relevantCancerTypesModalStore.level ? `LEVEL_${relevantCancerTypesModalStore.level}` : null
          )
        ).data;

        if (!relevantCancerTypesModalStore.firebaseRelevantCancerTypes) {
          relevantCancerTypesModalStore.setRelevantCancerTypes(
            fetchedRelevantCancerTypes.map(rct => convertFetchedCancerTypeToRelevantCancerType(rct, false))
          );
          return;
        }

        const rcts = fetchedRelevantCancerTypes.map(rct => {
          for (const firebaseRct of relevantCancerTypesModalStore.firebaseRelevantCancerTypes) {
            if ((rct.code && rct.code === firebaseRct.code) || (!rct.code && !firebaseRct.code && rct.mainType === firebaseRct.mainType)) {
              return convertFetchedCancerTypeToRelevantCancerType(rct, false);
            }
          }
          return convertFetchedCancerTypeToRelevantCancerType(rct, true);
        });
        relevantCancerTypesModalStore.setRelevantCancerTypes(rcts);
      }

      setRelevantCancerTypes();
    }, []);

    useEffect(() => {
      return () => {
        relevantCancerTypesModalStore.closeModal();
      };
    }, []);

    const columns: SearchColumn<RelevantCancerType>[] = [
      {
        Header: 'Cancer Type',
        onFilter(data, keyword) {
          return data.mainType?.toLowerCase().includes(keyword) || false;
        },
        Cell({ original }: CellInfo) {
          const rct = original as RelevantCancerType;

          return (
            <Container>
              <Row className={classNames('d-flex', 'align-items-center', 'all-children-margin')}>
                {rct.isDeleted ? <s>{rct.mainType}</s> : <span>{rct.mainType}</span>}
                {rct.isDeleted && (
                  <DefaultBadge
                    color="danger"
                    text="Deleted"
                    tooltipOverlay={<span>This RCT is deleted. Press the revert button to undo the deletion.</span>}
                  />
                )}
              </Row>
            </Container>
          );
        },
      },
      {
        Header: 'Cancer Type Details',
        onFilter(data, keyword) {
          return data.subtype?.toLowerCase().includes(keyword) || false;
        },
        Cell({ original }: CellInfo) {
          const rct = original as RelevantCancerType;

          return (
            <Container>
              <Row className={classNames('d-flex', 'align-items-center', 'all-children-margin')}>
                {rct.isDeleted ? <s>{rct.subtype}</s> : <span>{rct.subtype}</span>}
              </Row>
            </Container>
          );
        },
      },
      {
        Header: 'Code',
        maxWidth: 120,
        onFilter(data, keyword) {
          return data.code?.toLowerCase().includes(keyword) || false;
        },
        Cell({ original }: CellInfo) {
          const rct = original as RelevantCancerType;

          return (
            <Container>
              <Row className={classNames('d-flex', 'align-items-center', 'all-children-margin')}>
                {rct.isDeleted ? <s>{rct.code}</s> : <span>{rct.code}</span>}
              </Row>
            </Container>
          );
        },
      },
      {
        Header: 'Actions',
        sortable: false,
        maxWidth: 70,
        Cell({ original, index }: CellInfo) {
          const rct = original as RelevantCancerType;

          return (
            <Container>
              <Row className={classNames('d-flex', 'align-items-center', 'all-children-margin')}>
                {rct.isDeleted ? (
                  <ActionIcon
                    icon={faUndo}
                    color={ONCOKB_BLUE}
                    onClick={() => {
                      relevantCancerTypesModalStore.setDeleted(index, false);
                    }}
                  />
                ) : (
                  <ActionIcon
                    icon={faTrashAlt}
                    color={DANGER}
                    onClick={() => {
                      relevantCancerTypesModalStore.setDeleted(index, true);
                    }}
                  />
                )}
              </Row>
            </Container>
          );
        },
      },
    ];

    return (
      <Modal isOpen style={{ maxWidth: '650px' }}>
        <ModalHeader>Modify Relevant Cancer Types</ModalHeader>
        <ModalBody>
          {relevantCancerTypesModalStore.relevantCancerTypes.length > 50 && (
            <Alert color="warning" fade={false} isOpen={showWarning} toggle={() => setShowWarning(false)}>
              There are more than 50 cancer types. You may want to consider modifying the cancer type above this section and adding excluded
              cancer types instead.
            </Alert>
          )}
          <OncoKBTable
            style={{ minHeight: '400px' }}
            showPageSizeOptions={false}
            defaultPageSize={5}
            data={relevantCancerTypesModalStore.relevantCancerTypes}
            columns={columns}
          />
        </ModalBody>
        <ModalFooter style={{ display: 'inline-block' }}>
          <div className="d-flex justify-content-between">
            {allCancerTypesDeleted ? (
              <div className="error-message">
                <FaExclamationCircle className="mr-2" size={'25px'} />
                <span>You must include at least one cancer type</span>
              </div>
            ) : (
              <div />
            )}
            <div>
              {relevantCancerTypesModalStore.relevantCancerTypes.some(rct => rct.isDeleted) && (
                <>
                  <InfoIcon
                    className="text-danger"
                    placement="top"
                    overlay={'Click "Reset" to restore all deleted relevant cancer types'}
                  />
                  <Button
                    outline
                    color="danger"
                    className="ml-1 mr-2"
                    onClick={() => {
                      relevantCancerTypesModalStore.setRelevantCancerTypes(
                        relevantCancerTypesModalStore.relevantCancerTypes.map(rct => ({ ...rct, isDeleted: false }))
                      );
                    }}
                  >
                    Reset
                  </Button>
                </>
              )}
              <Button className="mr-2" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                color="primary"
                disabled={allCancerTypesDeleted}
                onClick={() => {
                  const savedRelevantCancerTypes = relevantCancerTypesModalStore.relevantCancerTypes
                    .filter(rct => !rct.isDeleted)
                    .map(rct => {
                      const ct = new CancerType();
                      ct.mainType = rct.mainType;
                      ct.subtype = rct.subtype;
                      ct.code = rct.code;
                      return ct;
                    });

                  onConfirm(
                    savedRelevantCancerTypes,
                    savedRelevantCancerTypes.length === relevantCancerTypesModalStore.relevantCancerTypes.length
                  );
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    );
  }
);

const mapStoreToProps = ({ relevantCancerTypesModalStore }: IRootStore) => ({
  relevantCancerTypesModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(RelevantCancerTypesModal);
