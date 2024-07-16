import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Col, Input, InputGroup, Row } from 'reactstrap';
import Select, { GroupBase, OptionsOrGroups } from 'react-select';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { filterByKeyword } from 'app/shared/util/utils';
import { AsyncSaveButton } from 'app/shared/button/AsyncSaveButton';
import { FirebaseGeneService } from 'app/service/firebase/firebase-gene-service';
import { getFirebaseGenePath } from 'app/shared/util/firebase/firebase-utils';
import { GenomicIndicator } from 'app/shared/model/firebase/firebase.model';
import { observer } from 'mobx-react';
import StatusIcon, { Status } from 'app/shared/icons/StatusIcon';
import { FirebaseGeneReviewService } from 'app/service/firebase/firebase-gene-review-service';
import { ALLELE_STATE } from 'app/config/constants/firebase';
import { Column } from 'react-table';
import pluralize from 'pluralize';
import {
  DATA_IMPORT_DATA_TABLE_ID,
  DATA_IMPORT_DATA_TYPE_SELECT_ID,
  DATA_IMPORT_FILE_FORMAT_WARNING_ALERT_ID,
  DATA_IMPORT_FILE_UPLOAD_INPUT_ID,
  DATA_IMPORT_GENETIC_TYPE_SELECT_ID,
  DATA_IMPORT_IMPORT_BUTTON_ID,
  DATA_IMPORT_OPTIONAL_COLUMNS_INFO_ALERT_ID,
  DATA_IMPORT_REQUIRED_COLUMNS_INFO_ALERT_ID,
} from 'app/config/constants/html-id';
import { tsvToArray } from 'app/shared/util/file-utils';

export interface ICurationToolsTabProps extends StoreProps {}

type ImportStatus = 'initialized' | 'pending' | 'complete' | 'warning' | 'error';

type DataRow = {
  data: { [key: string]: string };
} & DataImportStatus;

type DataImportTypeSelectOption = {
  value: DataImportType;
  label: string;
};

enum DataImportType {
  GENE_GENOMIC_INDICATOR,
  GENE_SUMMARY,
  GENE_BACKGROUND,
}

class DataImportStatus {
  status: ImportStatus = 'initialized';
  message: string = '';
}

const getSelectOption = (dataImportType: DataImportType): DataImportTypeSelectOption => {
  return {
    value: dataImportType,
    label: dataImportTypesLabel[dataImportType],
  };
};
const getSelectOptions = (isGermline: boolean): OptionsOrGroups<any, GroupBase<any>> => {
  if (isGermline) {
    return [
      {
        label: 'Gene Level',
        options: [DataImportType.GENE_SUMMARY, DataImportType.GENE_BACKGROUND, DataImportType.GENE_GENOMIC_INDICATOR].map(getSelectOption),
      },
    ];
  } else {
    return [
      {
        label: 'Gene Level',
        options: [DataImportType.GENE_SUMMARY, DataImportType.GENE_BACKGROUND].map(getSelectOption),
      },
    ];
  }
};
const dataImportTypesLabel: { [key in DataImportType]: string } = {
  [DataImportType.GENE_GENOMIC_INDICATOR]: 'Genomic Indicator',
  [DataImportType.GENE_SUMMARY]: 'Summary',
  [DataImportType.GENE_BACKGROUND]: 'Background',
};

const getRequiredColumns = (dataType: DataImportType) => {
  switch (dataType) {
    case DataImportType.GENE_GENOMIC_INDICATOR:
      return ['hugo_symbol', 'genomic_indicator'];
    case DataImportType.GENE_SUMMARY:
    case DataImportType.GENE_BACKGROUND:
      return ['hugo_symbol', 'value'];
    default:
      return [];
  }
};

const getOptionalColumns = (dataType: DataImportType) => {
  switch (dataType) {
    case DataImportType.GENE_GENOMIC_INDICATOR:
      return ['description', 'allele_state'];
    default:
      return [];
  }
};

const alleleStateCheck = async (
  alleleStates: string[],
  onValidAlleleStates: () => Promise<DataImportStatus>,
): Promise<DataImportStatus> => {
  let status = new DataImportStatus();

  const unmappedAlleleStates: string[] = [];
  if (alleleStates) {
    // validate allele state is correct
    alleleStates.forEach(alleleState => {
      if (!Object.values(ALLELE_STATE).includes(alleleState as ALLELE_STATE)) {
        unmappedAlleleStates.push(alleleState);
      }
    });
  }
  if (unmappedAlleleStates.length > 0) {
    status.status = 'error';
    status.message = `${unmappedAlleleStates.join(', ')} ${pluralize('is', unmappedAlleleStates.length)} not supported. Only ${Object.values(ALLELE_STATE).join(', ')} are supported.`;
  } else {
    status = await onValidAlleleStates();
  }
  return Promise.resolve(status);
};

const geneCheck = async (
  firebaseGeneService: FirebaseGeneService,
  isGermline: boolean,
  hugoSymbol: string,
  onGeneExists: () => Promise<DataImportStatus>,
) => {
  const status = new DataImportStatus();
  hugoSymbol = hugoSymbol.trim();
  if (hugoSymbol) {
    const genePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const geneData = await firebaseGeneService.getObject(genePath);
    if (geneData.exists()) {
      return onGeneExists();
    } else {
      status.status = 'error';
      status.message = 'Gene does not exist. Please create before importing';
    }
  } else {
    status.status = 'error';
    status.message = 'Gene is missing from data';
  }
  return Promise.resolve(status);
};

const saveGenericGeneDataToFirebase = async (
  firebaseGeneService: FirebaseGeneService,
  firebaseGeneReviewService: FirebaseGeneReviewService,
  isGermline: boolean,
  hugoSymbol: string,
  genePropKey: string,
  propValue: string,
): Promise<DataImportStatus> => {
  hugoSymbol = hugoSymbol.trim();
  propValue = propValue.trim();
  return geneCheck(firebaseGeneService, isGermline, hugoSymbol, async () => {
    const genePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const valPath = genePath + '/' + genePropKey;
    const valData = await firebaseGeneService.getObject(valPath);
    const status = new DataImportStatus();
    if (valData.exists()) {
      const reviewData = await firebaseGeneService.getObject(`${genePath}/${genePropKey}_review`);
      const uuidData = await firebaseGeneService.getObject(`${genePath}/${genePropKey}_uuid`);
      if (propValue !== valData.val()) {
        await firebaseGeneReviewService.updateReviewableContent(valPath, valData.val(), propValue, reviewData.val(), uuidData.val());
        status.status = 'complete';
      } else {
        status.status = 'warning';
        status.message = 'The data is identical to production, no update needed.';
      }
    } else {
      status.status = 'error';
      status.message = `The gene property \`${genePropKey}\`does not exist. Skip importing`;
    }
    return Promise.resolve(status);
  });
};

const saveGenomicIndicator = async (
  firebaseGeneService: FirebaseGeneService,
  genomicIndicatorsPath: string,
  name: string,
  description?: string,
  alleleStates?: ALLELE_STATE[],
): Promise<DataImportStatus> => {
  await firebaseGeneService.addGenomicIndicator(true, genomicIndicatorsPath, name, description, alleleStates);
  return Promise.resolve({
    status: 'complete',
    message: '',
  });
};

const saveDataToFirebase: {
  [key in DataImportType]: (
    firebaseGeneService: FirebaseGeneService,
    firebaseGeneReviewService: FirebaseGeneReviewService,
    isGermline: boolean,
    data: DataRow,
  ) => Promise<DataRow>;
} = {
  async [DataImportType.GENE_GENOMIC_INDICATOR](firebaseGeneService, firebaseGeneReviewService, isGermline, data) {
    const hugoSymbol = data.data.hugo_symbol.trim();
    return {
      data: data.data,
      ...(await geneCheck(firebaseGeneService, isGermline, hugoSymbol, async () => {
        const genomicIndicatorName = data.data.genomic_indicator.trim();
        const genePath = getFirebaseGenePath(isGermline, hugoSymbol);
        const gipath = genePath + '/genomic_indicators';
        const giData = await firebaseGeneService.getObject(gipath);
        const alleleStates = data.data['allele_state']
          .split(',')
          .map(state => state.trim())
          .filter(state => !!state);
        return Promise.resolve(
          await alleleStateCheck(alleleStates, async () => {
            let status = new DataImportStatus();
            if (giData.exists()) {
              const genomicIndicators: GenomicIndicator[] = giData.val();
              if (genomicIndicators.filter(gi => gi.name.toLowerCase() === genomicIndicatorName.toLowerCase()).length > 0) {
                status.status = 'error';
                status.message = 'Genomic indicator already exists';
              } else {
                status = await saveGenomicIndicator(
                  firebaseGeneService,
                  gipath,
                  genomicIndicatorName,
                  data.data.description,
                  alleleStates as ALLELE_STATE[],
                );
              }
            } else {
              status = await saveGenomicIndicator(
                firebaseGeneService,
                gipath,
                genomicIndicatorName,
                data.data.description,
                alleleStates as ALLELE_STATE[],
              );
            }
            return Promise.resolve(status);
          }),
        );
      })),
    };
  },
  async [DataImportType.GENE_SUMMARY](firebaseGeneService, firebaseGeneReviewService, isGermline, data) {
    return {
      data: data.data,
      ...(await saveGenericGeneDataToFirebase(
        firebaseGeneService,
        firebaseGeneReviewService,
        isGermline,
        data.data.hugo_symbol,
        'summary',
        data.data.value,
      )),
    };
  },
  async [DataImportType.GENE_BACKGROUND](firebaseGeneService, firebaseGeneReviewService, isGermline, data) {
    return {
      data: data.data,
      ...(await saveGenericGeneDataToFirebase(
        firebaseGeneService,
        firebaseGeneReviewService,
        isGermline,
        data.data.hugo_symbol,
        'background',
        data.data.value,
      )),
    };
  },
};

const CurationDataImportTab = observer(({ firebaseGeneService, firebaseGeneReviewService }: ICurationToolsTabProps) => {
  const [isGermline, setIsGermline] = useState(false);
  const [selectedDataTypeOption, setSelectedDateTypeOption] = useState<DataImportTypeSelectOption | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [fileRows, setFileRows] = useState<DataRow[]>([]);
  const [fileUploadErrorMsg, setFileUploadErrorMsg] = useState('');
  const [importStatus, setImportStatus] = useState<'' | 'uploaded' | 'importing' | 'imported'>('');
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const IMPORT_STATUS_HEADER_KEY = 'status';
  const IMPORT_STATUS_ERR_MSG_HEADER_KEY = 'message';
  const ROW_COLUMN_KEY = 'row_id';

  // Initiate a file reader and attach the onload event after uploading the file from the user
  const fileReader = new FileReader();
  fileReader.onload = event => {
    setFileUploadErrorMsg('');
    const text = (event.target?.result ?? '') as string;
    tsvFileToArray(text);
  };

  const requiredCols: string[] = selectedDataTypeOption !== null ? getRequiredColumns(selectedDataTypeOption.value) : [];
  const optionalCols: string[] = selectedDataTypeOption !== null ? getOptionalColumns(selectedDataTypeOption.value) : [];

  // reset import status after changing gene type and data type
  useEffect(() => {
    resetFileStatus();
  }, [isGermline, selectedDataTypeOption]);

  const resetFileStatus = () => {
    setFileUploadErrorMsg('');
    setImportStatus('');
    setFileHeaders([]);
    setFileRows([]);

    if (fileUploadInputRef.current) {
      fileUploadInputRef.current.value = null as unknown as string;
    }
  };

  const tsvFileToArray = (fileString: string) => {
    const contentList = tsvToArray(fileString);

    const headers = contentList.length > 0 ? contentList[0].map(header => header.trim().toLowerCase()) : [];
    const rows = contentList.slice(1);

    // check the headers
    const allRequiredColsExist = requiredCols.every(col => headers.includes(col));
    if (!allRequiredColsExist) {
      setFileUploadErrorMsg('Not all required columns are presented in the file');
      return;
    }
    setFileHeaders(headers);

    const content = rows.map((row, rowIndex) => {
      const obj = headers.reduce(
        (object, header, index) => {
          object.data[header] = (row[index] || '').trim();
          return object;
        },
        {
          data: {},
          status: 'initialized',
          message: '',
        } as DataRow,
      );
      obj.data[ROW_COLUMN_KEY] = `${rowIndex + 1}`;
      return obj;
    });
    setFileRows(content);
  };

  const onFileUpload = e => {
    if (e.target.files.length === 0) {
      setFileUploadErrorMsg('No file is selected.');
    } else if (e.target.files.length > 1) {
      setFileUploadErrorMsg('We only support uploading one file at a time.');
    } else {
      setImportStatus('uploaded');
      fileReader.readAsText(e.target.files[0]);
    }
  };

  const getImportStatusIcon = (status: ImportStatus, message?: string) => {
    let siStatus: undefined | Status;
    switch (status) {
      case 'complete':
        siStatus = 'success';
        break;
      case 'error':
        siStatus = 'fail';
        break;
      case 'warning':
        siStatus = 'warning';
        break;
      default:
        break;
    }
    if (siStatus) {
      return <StatusIcon type={message ? 'tooltip' : undefined} status={siStatus} message={message} />;
    } else {
      return <></>;
    }
  };

  const onImportConfirm = async () => {
    if (!firebaseGeneService || !firebaseGeneReviewService || !selectedDataTypeOption) {
      return;
    }
    setImportStatus('importing');

    for (let i = 0; i < fileRows.length; i++) {
      const row = fileRows[i];
      // clean up the import status fields before importing
      row.message = '';
      row.status = 'initialized';
      fileRows[i] = await saveDataToFirebase[selectedDataTypeOption.value](firebaseGeneService, firebaseGeneReviewService, isGermline, row);
    }
    setFileRows(fileRows);

    setImportStatus('imported');
  };

  const getTableColumns = () => {
    const columns: Column[] = [
      {
        accessor: ROW_COLUMN_KEY,
        Header: 'Row #',
        maxWidth: 60,
      },
    ];
    if (importStatus === 'imported') {
      columns.push({
        accessor: IMPORT_STATUS_HEADER_KEY,
        Header: 'Import Status',
        maxWidth: 120,
        Cell(data) {
          return (
            <div className={'text-center'}>
              {getImportStatusIcon(data.original[IMPORT_STATUS_HEADER_KEY], data.original[IMPORT_STATUS_ERR_MSG_HEADER_KEY])}
            </div>
          );
        },
      });
    }
    columns.push(
      ...fileHeaders.map(header => {
        return {
          accessor: header,
          Header: header,
          onFilter: (data, keyword) => filterByKeyword(data[header], keyword),
        };
      }),
    );
    return columns;
  };

  return (
    <div className={'mb-5'}>
      <Row>
        <Col>
          <div className={'d-flex'}>
            <Select
              id={DATA_IMPORT_GENETIC_TYPE_SELECT_ID}
              instanceId={DATA_IMPORT_GENETIC_TYPE_SELECT_ID}
              styles={{
                container: base => ({
                  ...base,
                  minWidth: 150,
                  marginRight: '0.5rem',
                }),
              }}
              options={[
                {
                  label: 'Somatic',
                  value: 'somatic',
                },
                {
                  label: 'Germline',
                  value: 'germline',
                },
              ]}
              isSearchable={false}
              defaultValue={{ value: 'somatic', label: 'Somatic' }}
              onChange={option => {
                setIsGermline(option?.value === 'germline');
                setSelectedDateTypeOption(null);
              }}
            ></Select>
            <Select
              id={DATA_IMPORT_DATA_TYPE_SELECT_ID}
              instanceId={DATA_IMPORT_DATA_TYPE_SELECT_ID}
              styles={{
                container: base => ({
                  ...base,
                  width: '100%',
                }),
              }}
              value={selectedDataTypeOption}
              options={getSelectOptions(isGermline)}
              onChange={option => setSelectedDateTypeOption(option)}
              isClearable
              placeholder={'Select data type to import'}
            ></Select>
          </div>
        </Col>
      </Row>
      {selectedDataTypeOption !== null && (
        <Row>
          <Col>
            <div>
              <Alert color={'warning'} className={'mt-3'} id={DATA_IMPORT_FILE_FORMAT_WARNING_ALERT_ID}>
                Please upload file that is tab delimited only. The file needs to include the headers as the first row.
              </Alert>
              <Alert className={'mt-3'}>
                <div id={DATA_IMPORT_REQUIRED_COLUMNS_INFO_ALERT_ID}>
                  The following columns are required <b>{requiredCols.join(', ')}</b>
                </div>
                {optionalCols.length > 0 && (
                  <div id={DATA_IMPORT_OPTIONAL_COLUMNS_INFO_ALERT_ID}>
                    The following columns are optional <b>{optionalCols.join(', ')}</b>
                  </div>
                )}
              </Alert>
              <div className={'d-flex'}>
                <InputGroup>
                  <Input
                    id={DATA_IMPORT_FILE_UPLOAD_INPUT_ID}
                    name="file"
                    type="file"
                    onChange={onFileUpload}
                    innerRef={fileUploadInputRef}
                  />
                  <Button color="secondary" onClick={resetFileStatus}>
                    Clear
                  </Button>
                </InputGroup>
              </div>
              {fileUploadErrorMsg && (
                <Alert color={'danger'} className={'mt-3'}>
                  {fileUploadErrorMsg}
                </Alert>
              )}
            </div>
          </Col>
        </Row>
      )}
      {fileRows.length > 0 && (
        <>
          <Row>
            <Col className={'mt-3'} id={DATA_IMPORT_DATA_TABLE_ID}>
              <OncoKBTable
                columns={getTableColumns()}
                data={fileRows.map(row => {
                  const dataRow = row.data;
                  dataRow[IMPORT_STATUS_HEADER_KEY] = row.status;
                  dataRow[IMPORT_STATUS_ERR_MSG_HEADER_KEY] = row.message;
                  return dataRow;
                })}
                showPagination
                defaultPageSize={5}
              />
            </Col>
          </Row>
          <Row>
            <Col className={'d-flex justify-content-md-end mt-2'}>
              <AsyncSaveButton
                id={DATA_IMPORT_IMPORT_BUTTON_ID}
                isSavePending={importStatus === 'importing'}
                onClick={onImportConfirm}
                confirmText={'Import'}
                disabled={
                  isGermline === undefined || selectedDataTypeOption === null || fileRows.length === 0 || importStatus === 'importing'
                }
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
});

const mapStoreToProps = ({ firebaseGeneService, firebaseGeneReviewService }: IRootStore) => ({
  firebaseGeneService,
  firebaseGeneReviewService,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationDataImportTab);
