import React, { useMemo, useRef, useState } from 'react';
import { Vus, VusObjList } from 'app/shared/model/firebase/firebase.model';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { Button, Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { TextFormat } from 'react-jhipster';
import { APP_DATETIME_FORMAT } from 'app/config/constants/constants';
import _ from 'lodash';
import { IUser } from 'app/shared/model/user.model';

export interface IVusTableProps {
  vusObjList: VusObjList;
  hugoSymbol: string;
  account: IUser;
  handleFirebaseUpdate: (path: string, updatedVus: VusObjList) => Promise<void>;
  handleFirebaseDelete: (path: string) => Promise<void>;
}

type VusTableData = Vus & {
  uuid: string;
};

const VUS_NAME = 'Variant';
const LAST_EDITED_BY = 'Last Edited By';
const LAST_EDITED_AT = 'Last Edited At';
const LATEST_COMMENT = 'Latest Comment';

const VusTable = ({ vusObjList, hugoSymbol, account, handleFirebaseUpdate, handleFirebaseDelete }: IVusTableProps) => {
  const currentActionVusUuid = useRef<string>(null);
  const firebaseVusPath = getFirebasePath('VUS', hugoSymbol);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const vusList: VusTableData[] = useMemo(
    () =>
      Object.keys(vusObjList).map(uuid => {
        return { uuid, ...vusObjList[uuid] };
      }),
    [vusObjList]
  );
  //TODO: it is checking by reference, change this

  async function handleUpdate() {}

  function handleDownload() {
    const headerRow = `${VUS_NAME}\t${LAST_EDITED_BY}\t${LAST_EDITED_AT}\t${LATEST_COMMENT}`;
    const dataRows = [];
    for (const vus of vusList) {
      dataRows.push(`${vus.name}\t${vus.time.by.name}\t${vus.time.value}\t${vus.name_comments?.[0].content || ''}`);
    }
    const tsvContent = [headerRow, ...dataRows].join('\n');

    const blob = new Blob([tsvContent], { type: 'text/tsv' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'vus.tsv';
    downloadLink.click();
  }

  async function handleRefresh(uuid: string) {
    const newVusObjList = _.cloneDeep(vusObjList);
    const vusToUpdate = newVusObjList[uuid];
    let name: string;
    if (account.firstName && account.lastName) {
      name = `${account.firstName} ${account.lastName}`;
    } else if (account.firstName) {
      name = account.firstName;
    } else {
      name = account.lastName;
    }
    vusToUpdate.time.by.name = name;
    vusToUpdate.time.by.email = account.email;
    vusToUpdate.time.value = Date.now();

    await handleFirebaseUpdate(`${firebaseVusPath}`, newVusObjList);
  }

  async function handleDelete() {
    await handleFirebaseDelete(`${firebaseVusPath}/${currentActionVusUuid.current}`);
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
      Header: LAST_EDITED_BY,
      accessor: 'time.by.name',
      onFilter(data, keyword) {
        return data.time.by.name.toLowerCase().includes(keyword);
      },
    },
    {
      Header: LAST_EDITED_AT,
      accessor: 'time.value',
      Cell(cell: { original: Vus }) {
        const time = cell.original.time.value;
        return <TextFormat value={new Date(time)} type="date" format={APP_DATETIME_FORMAT} />;
      },
    },
    {
      Header: LATEST_COMMENT,
      accessor: 'name_comments[0].content',
    },
    {
      id: 'actions',
      Header: 'Actions',
      Cell(cell: { original: VusTableData }) {
        return (
          <div>
            <Button
              className="mr-2"
              size="sm"
              color="primary"
              onClick={async () => {
                await handleRefresh(cell.original.uuid);
              }}
            >
              <FontAwesomeIcon icon={'sync'} />
            </Button>
            <Button
              className="mr-2"
              size="sm"
              color="danger"
              onClick={() => {
                currentActionVusUuid.current = cell.original.uuid;
                setShowConfirmModal(true);
              }}
            >
              <FontAwesomeIcon icon={'trash'} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className={'justify-content-between align-items-center mt-4'}>
      <Col>
        <Row className="justify-content-between mb-3">
          <h5>Variants of Unknown Signficance (Investigated and data not found):</h5>
          <div>
            <Button onClick={handleUpdate} className="mr-1" color="primary" size="md">
              Update to database
            </Button>
            <Button onClick={handleDownload} color="primary" size="md">
              Download
            </Button>
          </div>
        </Row>
      </Col>
      <OncoKBTable data={vusList} columns={columns} showPagination />
      <SimpleConfirmModal
        title="Confirm delete operation"
        body={'Are you sure you want to delete this VUS?'}
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
  );
};

export default VusTable;
