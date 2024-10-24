import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mutation, Review, Vus } from 'app/shared/model/firebase/firebase.model';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { Button, Container, Row } from 'reactstrap';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import {
  getAllCommentsString,
  getFirebaseGenePath,
  getFirebaseVusPath,
  getMostRecentComment,
  getVusTimestampClass,
} from 'app/shared/util/firebase/firebase-utils';
import { TextFormat } from 'react-jhipster';
import { APP_DATETIME_FORMAT, MAX_COMMENT_LENGTH } from 'app/config/constants/constants';
import _ from 'lodash';
import { formatDate } from 'app/shared/util/utils';
import CommentIcon from 'app/shared/icons/CommentIcon';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import classNames from 'classnames';
import AddButton from 'app/pages/curation/button/AddButton';
import { get, onValue, ref } from 'firebase/database';
import { downloadFile } from 'app/shared/util/file-utils';
import { VusRecencyInfoIcon } from 'app/shared/icons/VusRecencyInfoIcon';
import DefaultBadge from 'app/shared/badge/DefaultBadge';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faSync, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { DANGER, PRIMARY } from 'app/config/colors';
import AddVusModal from '../modal/AddVusModal';
import MutationConvertIcon from '../icons/MutationConvertIcon';
import AddMutationModal from '../modal/AddMutationModal';
import { Unsubscribe } from 'firebase/database';
import { VUS_TABLE_ID } from 'app/config/constants/html-id';
import { SentryError } from 'app/config/sentry-error';

export interface IVusTableProps extends StoreProps {
  hugoSymbol: string | undefined;
  isGermline: boolean;
  mutationsSectionRef: React.RefObject<HTMLDivElement>;
}

type VusTableData = Vus & {
  uuid: string;
};

const VUS_NAME = 'Variant';
const LAST_EDITED_BY = 'Last Edited By';
const LAST_EDITED_AT = 'Last Edited At';
const LATEST_COMMENT = 'Latest Comment';

const VusTable = ({
  firebaseDb,
  addMutation,
  hugoSymbol,
  mutationsSectionRef,
  isGermline,
  account,
  sendVusToCore,
  addVus,
  refreshVus,
  deleteVus,
  setOpenMutationCollapsibleIndex,
}: IVusTableProps) => {
  const firebaseVusPath = getFirebaseVusPath(isGermline, hugoSymbol);
  const firebaseGenePath = getFirebaseGenePath(isGermline, hugoSymbol);
  const firebaseMutationsPath = `${firebaseGenePath}/mutations`;
  const currentActionVusUuid = useRef<string | null>(null);

  const [vusData, setVusData] = useState<Record<string, VusTableData> | null>(null);
  const [showAddVusModal, setShowAddVusModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [vusToPromote, setVusToPromote] = useState<VusTableData | null>(null);

  useEffect(() => {
    const callbacks: Unsubscribe[] = [];
    if (firebaseDb) {
      callbacks.push(
        onValue(ref(firebaseDb, firebaseVusPath), snapshot => {
          setVusData(snapshot.val());
        }),
      );
    }
    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, [firebaseDb]);

  const vusList: VusTableData[] = useMemo(() => {
    return vusData
      ? Object.entries(vusData).map(([uuid, rest]) => {
          return { ...rest, uuid };
        })
      : [];
  }, [vusData]);

  function handleDownload() {
    const headerRow = `${VUS_NAME}\t${LAST_EDITED_AT}\t${LAST_EDITED_BY}\t${LATEST_COMMENT}`;
    const dataRows: string[] = [];
    for (const vus of vusList) {
      const latestComment = vus.name_comments ? getMostRecentComment(vus.name_comments).content : '';
      const lastEditedAt = formatDate(new Date(vus.time.value));

      dataRows.push(`${vus.name}\t${lastEditedAt}\t${vus.time.by.name}\t${latestComment}`);
    }
    const tsvContent = [headerRow, ...dataRows].join('\n');

    downloadFile('vus.tsv', tsvContent);
  }

  async function handleRefresh(uuid: string) {
    try {
      if (vusData) {
        await refreshVus?.(`${firebaseVusPath}/${uuid}`, vusData[uuid]);
        syncVusWithCore();
      }
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleDelete() {
    try {
      await deleteVus?.(`${firebaseVusPath}/${currentActionVusUuid.current}`);
      syncVusWithCore();
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleAddVus(variants: string[]) {
    await addVus?.(firebaseVusPath, variants);
    setShowAddVusModal(false);
    syncVusWithCore();
  }

  async function syncVusWithCore() {
    try {
      if (firebaseDb && hugoSymbol) {
        const firebaseVus = (await get(ref(firebaseDb, firebaseVusPath))).val() as Record<string, Vus>;
        const vus = Object.values(firebaseVus);
        await sendVusToCore?.(hugoSymbol, vus);
      }
    } catch (e) {
      const error = new SentryError('Fail to submit VUS data to core.', { exception: e, hugoSymbol });
      console.error(error);
    }
  }

  const columns: SearchColumn<VusTableData>[] = [
    {
      Header: VUS_NAME,
      accessor: 'name',
      onFilter(data, keyword) {
        return data.name.toLowerCase().includes(keyword);
      },
    },
    {
      Header: (
        <>
          <span>{LAST_EDITED_AT}</span>
          <VusRecencyInfoIcon />
        </>
      ),
      id: LAST_EDITED_AT,
      accessor: 'time.value',
      width: 300,
      Cell(cell: { original: VusTableData }) {
        const time = cell.original.time.value;
        const color = getVusTimestampClass(time);
        return (
          <>
            <TextFormat value={new Date(time)} type="date" format={APP_DATETIME_FORMAT} />
            <span>{color && <DefaultBadge color={color} text={'Outdated'} style={{ fontSize: '0.8rem' }} />}</span>
          </>
        );
      },
    },
    {
      Header: LAST_EDITED_BY,
      accessor: 'time.by.name',
      onFilter(data, keyword) {
        return data.time.by.name.toLowerCase().includes(keyword);
      },
    },
    {
      Header: LATEST_COMMENT,
      accessor: 'name_comments',
      Cell(cell: { original: VusTableData }) {
        const latestComment = cell.original.name_comments ? getMostRecentComment(cell.original.name_comments).content : '';

        return (
          <span>{latestComment.length <= MAX_COMMENT_LENGTH ? latestComment : `${latestComment.slice(0, MAX_COMMENT_LENGTH)}...`}</span>
        );
      },
    },
    {
      id: 'actions',
      Header: 'Actions',
      width: 150,
      sortable: false,
      Cell(cell: { original: VusTableData }) {
        return (
          <div className={classNames('d-flex', 'align-items-center', 'all-children-margin')}>
            <CommentIcon id={cell.original.uuid} key={cell.original.uuid} path={`${firebaseVusPath}/${cell.original.uuid}/name_comments`} />
            <MutationConvertIcon
              mutationName={cell.original.name}
              tooltipProps={{ overlay: <div>Promote VUS to mutation</div> }}
              onClick={() => {
                setVusToPromote(cell.original);
                currentActionVusUuid.current = cell.original.uuid;
              }}
            />
            <ActionIcon
              icon={faSync}
              color={PRIMARY}
              onClick={async () => {
                await handleRefresh(cell.original.uuid);
              }}
              tooltipProps={{ overlay: <div>After rechecking that the variant is still a VUS, click to update the date to today.</div> }}
            />
            <ActionIcon
              icon={faTrashAlt}
              color={DANGER}
              onClick={() => {
                currentActionVusUuid.current = cell.original.uuid;
                setShowConfirmModal(true);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      {vusData ? (
        <div className={'justify-content-between align-items-center mt-5'} data-testid={VUS_TABLE_ID}>
          <div className={'d-flex align-items-center mb-2'}>
            <span style={{ fontSize: '1.25rem' }}>Variants of Unknown Significance (Investigated and data not found)</span>
            <AddButton className="ms-2" onClickHandler={() => setShowAddVusModal(true)} />
            <Button onClick={handleDownload} color="primary" size="sm" outline className={'ms-2'}>
              Download
            </Button>
          </div>
          <OncoKBTable defaultSorted={[{ id: LAST_EDITED_AT, desc: false }]} data={vusList} columns={columns} showPagination />
          <SimpleConfirmModal
            title="Confirm deletion"
            body={'Are you sure you want to delete this variant?'}
            show={showConfirmModal}
            confirmText="Delete"
            confirmColor="danger"
            confirmIcon="trash"
            cancelIcon={'ban'}
            onConfirm={async () => {
              await handleDelete();
              setShowConfirmModal(false);
              currentActionVusUuid.current = null;
            }}
            onCancel={() => {
              setShowConfirmModal(false);
              currentActionVusUuid.current = null;
            }}
          />
        </div>
      ) : (
        <AddButton className="mt-4" title="VUS" showIcon onClickHandler={() => setShowAddVusModal(true)} />
      )}
      {showAddVusModal ? (
        <AddVusModal
          hugoSymbol={hugoSymbol}
          isGermline={isGermline}
          vusList={vusData}
          onCancel={() => setShowAddVusModal(false)}
          onConfirm={handleAddVus}
        />
      ) : undefined}
      {vusToPromote ? (
        <AddMutationModal
          hugoSymbol={hugoSymbol}
          isGermline={isGermline}
          onConfirm={async (newMutation, newMutationFirebaseIndex) => {
            try {
              const aggregateComments = getAllCommentsString(vusToPromote.name_comments || []);
              handleDelete();
              return await addMutation?.(firebaseMutationsPath, newMutation, isGermline, true, aggregateComments).then(() => {
                notifySuccess(`Promoted ${vusToPromote.name}`, { position: 'top-right' });
              });
            } catch (error) {
              notifyError(error);
            } finally {
              setVusToPromote(null);
              currentActionVusUuid.current = null;
              setOpenMutationCollapsibleIndex?.(newMutationFirebaseIndex);
              mutationsSectionRef.current?.scrollIntoView();
            }
          }}
          onCancel={() => {
            setVusToPromote(null);
            currentActionVusUuid.current = null;
          }}
          convertOptions={{ isConverting: !!vusToPromote, alteration: vusToPromote.name }}
        />
      ) : undefined}
    </>
  );
};

const mapStoreToProps = ({
  firebaseAppStore,
  authStore,
  firebaseGeneService,
  firebaseVusService,
  openMutationCollapsibleStore,
}: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  addVus: firebaseVusService.addVus,
  refreshVus: firebaseVusService.refreshVus,
  deleteVus: firebaseVusService.deleteVus,
  account: authStore.account,
  fullName: authStore.fullName,
  addMutation: firebaseGeneService.addMutation,
  setOpenMutationCollapsibleIndex: openMutationCollapsibleStore.setOpenMutationCollapsibleIndex,
  sendVusToCore: firebaseVusService.sendVusToCore.bind(firebaseVusService),
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(VusTable));
