import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BoolString, Comment, Vus, VusObjList } from 'app/shared/model/firebase/firebase.model';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { Button, Container, Row } from 'reactstrap';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import { getFirebasePath, getMostRecentComment, getVusTimestampClass } from 'app/shared/util/firebase/firebase-utils';
import { TextFormat } from 'react-jhipster';
import { APP_DATETIME_FORMAT, MAX_COMMENT_LENGTH } from 'app/config/constants/constants';
import _ from 'lodash';
import { formatDate, getUserFullName } from 'app/shared/util/utils';
import CommentIcon from 'app/shared/icons/CommentIcon';
import { RecursivePartial } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { downloadFile } from '../util/file-utils';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { DANGER, PRIMARY } from 'app/config/colors';
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync';
import classNames from 'classnames';
import DefaultBadge from '../badge/DefaultBadge';
import InfoIcon from '../icons/InfoIcon';
import { VusRecencyInfoIcon } from '../icons/VusRecencyInfoIcon';

export interface IVusTableProps extends StoreProps {
  hugoSymbol: string;
}

type VusTableData = Vus & {
  uuid: string;
};

const VUS_NAME = 'Variant';
const LAST_EDITED_BY = 'Last Edited By';
const LAST_EDITED_AT = 'Last Edited At';
const LATEST_COMMENT = 'Latest Comment';

const VusTable = ({
  hugoSymbol,
  account,
  vusData,
  addVusListener,
  handleFirebaseUpdate,
  handleFirebaseDelete,
  handleFirebaseDeleteFromArray,
}: IVusTableProps) => {
  const currentActionVusUuid = useRef<string>(null);
  const firebaseVusPath = getFirebasePath('VUS', hugoSymbol);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const cleanupCallback = addVusListener(firebaseVusPath);

    return () => {
      cleanupCallback && cleanupCallback();
    };
  }, []);

  const vusList: VusTableData[] = useMemo(() => {
    return vusData
      ? Object.keys(vusData).map(uuid => {
          return { uuid, ...vusData[uuid] };
        })
      : null;
  }, [vusData]);

  function handleDownload() {
    const headerRow = `${VUS_NAME}\t${LAST_EDITED_AT}\t${LAST_EDITED_BY}\t${LATEST_COMMENT}`;
    const dataRows = [];
    for (const vus of vusList) {
      const latestComment = vus.name_comments ? getMostRecentComment(vus.name_comments).content : '';
      const lastEditedAt = formatDate(new Date(vus.time.value));

      dataRows.push(`${vus.name}\t${lastEditedAt}\t${vus.time.by.name}\t${latestComment}`);
    }
    const tsvContent = [headerRow, ...dataRows].join('\n');

    downloadFile('vus.tsv', tsvContent);
  }

  async function handleRefresh(uuid: string) {
    const newVusObjList = _.cloneDeep(vusData);
    const vusToUpdate = newVusObjList[uuid];
    vusToUpdate.time.by.name = getUserFullName(account);
    vusToUpdate.time.by.email = account.email;
    vusToUpdate.time.value = Date.now();

    try {
      await handleFirebaseUpdate(`${firebaseVusPath}`, newVusObjList);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleDelete() {
    try {
      await handleFirebaseDelete(`${firebaseVusPath}/${currentActionVusUuid.current}`);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleCreateComment(variantUuid: string, content: string) {
    const newComment = new Comment();
    newComment.content = content;
    newComment.email = account.email;
    newComment.resolved = 'false';
    newComment.userName = getUserFullName(account);

    const prevCommentsLength = vusData[variantUuid].name_comments?.length || 0;
    const updateObject: RecursivePartial<VusObjList> = {
      [variantUuid]: {
        name_comments: [...Array(prevCommentsLength).fill({}), newComment],
      },
    };

    try {
      await handleFirebaseUpdate(firebaseVusPath, updateObject);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleDeleteComments(variantUuid: string, indices: number[]) {
    try {
      await handleFirebaseDeleteFromArray(`${firebaseVusPath}/${variantUuid}/name_comments`, indices);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleSetCommentResolved(variantUuid: string, index: number, isResolved: BoolString) {
    const updateObject: RecursivePartial<VusObjList> = {
      [variantUuid]: {
        name_comments: [
          ...Array(index).fill({}),
          {
            resolved: isResolved,
          },
        ],
      },
    };

    try {
      await handleFirebaseUpdate(firebaseVusPath, updateObject);
    } catch (error) {
      notifyError(error);
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
      sortable: false,
      Cell(cell: { original: VusTableData }) {
        return (
          <Container>
            <Row className={classNames('d-flex', 'align-items-center', 'all-children-margin')}>
              <CommentIcon
                id={cell.original.uuid}
                key={cell.original.uuid}
                comments={cell.original.name_comments}
                onCreateComment={async content => {
                  await handleCreateComment(cell.original.uuid, content);
                }}
                onDeleteComments={async indices => {
                  await handleDeleteComments(cell.original.uuid, indices);
                }}
                onResolveComment={async index => {
                  await handleSetCommentResolved(cell.original.uuid, index, 'true');
                }}
                onUnresolveComment={async index => {
                  await handleSetCommentResolved(cell.original.uuid, index, 'false');
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
            </Row>
          </Container>
        );
      },
    },
  ];

  return vusData ? (
    <div className={'justify-content-between align-items-center mt-4'}>
      <div className={'d-flex align-items-baseline'}>
        <span style={{ fontSize: '1.25rem' }}>Variants of Unknown Significance (Investigated and data not found)</span>
        <Button onClick={handleDownload} color="primary" size="sm" outline className={'ml-2'}>
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
    <></>
  );
};

const mapStoreToProps = ({ firebaseVusStore, authStore }: IRootStore) => ({
  vusData: firebaseVusStore.data,
  addVusListener: firebaseVusStore.addListener,
  handleFirebaseUpdate: firebaseVusStore.update,
  handleFirebaseDelete: firebaseVusStore.delete,
  handleFirebaseDeleteFromArray: firebaseVusStore.deleteFromArray,
  account: authStore.account,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(VusTable));
