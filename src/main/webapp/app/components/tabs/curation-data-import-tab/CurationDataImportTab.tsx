import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Col, Input, InputGroup, Label, Row } from 'reactstrap';
import Select, { GroupBase, OptionsOrGroups } from 'react-select';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword } from 'app/shared/util/utils';
import { AsyncSaveButton } from 'app/shared/button/AsyncSaveButton';
import { FirebaseGeneService } from 'app/service/firebase/firebase-gene-service';
import { observer } from 'mobx-react';
import StatusIcon, { Status } from 'app/shared/icons/StatusIcon';
import { FirebaseGeneReviewService } from 'app/service/firebase/firebase-gene-review-service';
import { Column } from 'react-table';
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
import {
  geneCheck,
  GenericDI,
  GenomicIndicatorDI,
  GermlineMutationDI,
  saveGenericGeneData,
  saveGenomicIndicator,
  saveMutation,
  SomaticMutationDI,
} from 'app/components/tabs/curation-data-import-tab/import-methods';
import _, { groupBy } from 'lodash';
import { Mutation, VusObjList } from 'app/shared/model/firebase/firebase.model';
import { getFirebaseGenePath, getFirebaseVusPath } from 'app/shared/util/firebase/firebase-utils';
import { Alteration as ApiAlteration, AnnotateAlterationBody, Gene } from 'app/shared/api/generated/curation';
import { REFERENCE_GENOME } from 'app/config/constants/constants';
import { flow, flowResult } from 'mobx';

export interface ICurationToolsTabProps extends StoreProps {}

type ImportStatus = 'initialized' | 'pending' | 'complete' | 'warning' | 'error';

export type DataRow<T> = {
  data: {
    [K in keyof T]: T[K];
  };
} & DataImportStatus;

type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never;
}[keyof T];

type DataImportTypeSelectOption = {
  value: DataImportType;
  label: string;
};

enum DataImportType {
  GENE_GENOMIC_INDICATOR,
  GENE_SUMMARY,
  GENE_BACKGROUND,
  SOMATIC_MUTATION,
  GERMLINE_MUTATION,
}

export class DataImportStatus {
  status: ImportStatus = 'initialized';
  message: string = '';
}

const getSelectOption = (dataImportType: DataImportType): DataImportTypeSelectOption => {
  return {
    value: dataImportType,
    label: DATA_IMPORT_TYPES_LABEL[dataImportType],
  };
};
const getSelectOptions = (isGermline: boolean): OptionsOrGroups<DataImportTypeSelectOption, GroupBase<DataImportTypeSelectOption>> => {
  if (isGermline) {
    return [
      {
        label: 'Gene Level',
        options: [DataImportType.GENE_SUMMARY, DataImportType.GENE_BACKGROUND, DataImportType.GENE_GENOMIC_INDICATOR].map(getSelectOption),
      },
      {
        label: 'Mutation Level',
        options: [DataImportType.GERMLINE_MUTATION].map(getSelectOption),
      },
    ];
  } else {
    return [
      {
        label: 'Gene Level',
        options: [DataImportType.GENE_SUMMARY, DataImportType.GENE_BACKGROUND].map(getSelectOption),
      },
      {
        label: 'Mutation Level',
        options: [DataImportType.SOMATIC_MUTATION].map(getSelectOption),
      },
    ];
  }
};
const DATA_IMPORT_TYPES_LABEL: { [key in DataImportType]: string } = {
  [DataImportType.GENE_GENOMIC_INDICATOR]: 'Genomic Indicator',
  [DataImportType.GENE_SUMMARY]: 'Summary',
  [DataImportType.GENE_BACKGROUND]: 'Background',
  [DataImportType.SOMATIC_MUTATION]: 'Mutation',
  [DataImportType.GERMLINE_MUTATION]: 'Mutation',
};

export type DataImportObj = GenomicIndicatorDI | GenericDI | SomaticMutationDI | GermlineMutationDI;

const getRequiredColumns = <T extends DataImportObj>(dataType: DataImportType): RequiredKeys<T>[] => {
  switch (dataType) {
    case DataImportType.GENE_GENOMIC_INDICATOR:
      return ['hugo_symbol', 'genomic_indicator'] as RequiredKeys<T>[];
    case DataImportType.GENE_SUMMARY:
    case DataImportType.GENE_BACKGROUND:
      return ['hugo_symbol', 'value'] as RequiredKeys<T>[];
    case DataImportType.SOMATIC_MUTATION:
      return ['hugo_symbol', 'alteration', 'oncogenicity'] as RequiredKeys<T>[];
    case DataImportType.GERMLINE_MUTATION:
      return ['hugo_symbol', 'alteration', 'pathogenicity'] as RequiredKeys<T>[];
    default:
      return [];
  }
};

const getOptionalColumns = <T extends DataImportObj>(dataType: DataImportType): OptionalKeys<T>[] => {
  switch (dataType) {
    case DataImportType.GENE_GENOMIC_INDICATOR:
      return ['description', 'allele_state'] as OptionalKeys<T>[];
    case DataImportType.SOMATIC_MUTATION:
      return ['name', 'protein_change', 'mutation_effect', 'description'] as OptionalKeys<T>[];
    case DataImportType.GERMLINE_MUTATION:
      return ['name', 'protein_change', 'description'] as OptionalKeys<T>[];
    default:
      return [];
  }
};

type GenomicIndicatorSaveDataFunc = (
  firebaseGeneService: FirebaseGeneService,
  isGermline: boolean,
  createGene: boolean,
  data: DataRow<GenomicIndicatorDI>,
) => Promise<DataRow<GenomicIndicatorDI>>;

type GenericGeneDataSaveDataFunc = (
  firebaseGeneService: FirebaseGeneService,
  firebaseGeneReviewService: FirebaseGeneReviewService,
  isGermline: boolean,
  createGene: boolean,
  data: DataRow<GenericDI>,
) => Promise<DataRow<GenericDI>>;

type MutationSaveDataFunc<T> = (
  authStore,
  firebaseGeneService,
  firebaseMetaService,
  alterationStore,
  isGermline,
  createGene,
  data,
  mutationList: Mutation[],
  vusList: VusObjList,
) => Promise<DataRow<T>>;

type DataImportTypeSaveDataFunc = {
  [DataImportType.GENE_GENOMIC_INDICATOR]: GenomicIndicatorSaveDataFunc;
  [DataImportType.GENE_SUMMARY]: GenericGeneDataSaveDataFunc;
  [DataImportType.GENE_BACKGROUND]: GenericGeneDataSaveDataFunc;
  [DataImportType.GERMLINE_MUTATION]: MutationSaveDataFunc<GermlineMutationDI>;
  [DataImportType.SOMATIC_MUTATION]: MutationSaveDataFunc<SomaticMutationDI>;
};

const saveDataToFirebase: {
  [key in DataImportType]: key extends keyof DataImportTypeSaveDataFunc ? DataImportTypeSaveDataFunc[key] : null;
} = {
  async [DataImportType.GENE_GENOMIC_INDICATOR](firebaseGeneService, isGermline, createGene, data) {
    const hugoSymbol = data.data.hugo_symbol.trim();
    return {
      data: data.data,
      ...(await saveGenomicIndicator(firebaseGeneService, data, hugoSymbol, isGermline, createGene)),
    };
  },
  async [DataImportType.GENE_SUMMARY](firebaseGeneService, firebaseGeneReviewService, isGermline, createGene, data) {
    return {
      data: data.data,
      ...(await saveGenericGeneData(firebaseGeneService, firebaseGeneReviewService, isGermline, createGene, 'summary', data)),
    };
  },
  async [DataImportType.GENE_BACKGROUND](firebaseGeneService, firebaseGeneReviewService, isGermline, createGene, data) {
    return {
      data: data.data,
      ...(await saveGenericGeneData(firebaseGeneService, firebaseGeneReviewService, isGermline, createGene, 'background', data)),
    };
  },
  async [DataImportType.SOMATIC_MUTATION](
    authStore,
    firebaseGeneService,
    firebaseMetaService,
    alterationStore,
    isGermline,
    createGene,
    data,
    mutationList: Mutation[],
    vusList: VusObjList,
  ) {
    return {
      data: data.data,
      ...(await saveMutation(
        authStore,
        firebaseGeneService,
        firebaseMetaService,
        alterationStore,
        isGermline,
        createGene,
        data as DataRow<GermlineMutationDI>,
        mutationList,
        vusList,
      )),
    };
  },
  async [DataImportType.GERMLINE_MUTATION](
    authStore,
    firebaseGeneService,
    firebaseMetaService,
    annotateAlterations,
    isGermline,
    createGene,
    data,
    mutationList: Mutation[],
    vusList: VusObjList,
  ) {
    return {
      data: data.data,
      ...(await saveMutation(
        authStore,
        firebaseGeneService,
        firebaseMetaService,
        annotateAlterations,
        isGermline,
        createGene,
        data as DataRow<GermlineMutationDI>,
        mutationList,
        vusList,
      )),
    };
  },
};

const CurationDataImportTab = observer(
  ({ authStore, firebaseGeneService, firebaseGeneReviewService, firebaseMetaService, alterationStore }: ICurationToolsTabProps) => {
    const [isGermline, setIsGermline] = useState(false);
    const [createGene, setCreateGene] = useState(false);
    const [selectedDataTypeOption, setSelectedDateTypeOption] = useState<DataImportTypeSelectOption | null>(null);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [fileRows, setFileRows] = useState<DataRow<DataImportObj>[]>([]);
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

    const requiredCols: RequiredKeys<DataImportObj>[] =
      selectedDataTypeOption !== null ? getRequiredColumns(selectedDataTypeOption.value) : [];
    const optionalCols: OptionalKeys<DataImportObj>[] =
      selectedDataTypeOption !== null ? getOptionalColumns(selectedDataTypeOption.value) : [];

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
        fileUploadInputRef.current.value = '';
      }
    };

    const tsvFileToArray = (fileString: string) => {
      const contentList = tsvToArray(fileString);

      const headers = contentList.length > 0 ? contentList[0].map(header => header.trim().toLowerCase()).filter(header => !!header) : [];
      const rows = contentList.slice(1);

      // check the headers
      const allRequiredColsExist = requiredCols.every(col => headers.includes(col.toString()));
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
          } as DataRow<DataImportObj>,
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
        return <StatusIcon className={siStatus} type={message ? 'tooltip' : undefined} status={siStatus} message={message} />;
      } else {
        return <></>;
      }
    };

    const onImportConfirm = async () => {
      if (!authStore || !firebaseGeneService || !firebaseGeneReviewService || !firebaseMetaService || !selectedDataTypeOption) {
        return;
      }
      setImportStatus('importing');

      // initiate file rows
      for (let i = 0; i < fileRows.length; i++) {
        const row = fileRows[i];
        // clean up the import status fields before importing
        row.message = '';
        row.status = 'initialized';
      }

      // Validate the genes in batch
      const geneGroups = groupBy(fileRows, row => row.data.hugo_symbol);

      for (const [hugoSymbol, group] of Object.entries(geneGroups)) {
        const status = await geneCheck(firebaseGeneService, isGermline, createGene, hugoSymbol, () =>
          Promise.resolve(new DataImportStatus()),
        );
        if (status.status !== 'error') {
          const genePath: string = getFirebaseGenePath(isGermline, hugoSymbol);
          const mutations: Mutation[] = (await firebaseGeneService.firebaseRepository.get(`${genePath}/mutations`)).val();
          const vus: VusObjList = (await firebaseGeneService.firebaseRepository.get(getFirebaseVusPath(isGermline, hugoSymbol))).val();

          for (let i = 0; i < group.length; i++) {
            switch (selectedDataTypeOption.value) {
              case DataImportType.GENE_SUMMARY:
              case DataImportType.GENE_BACKGROUND:
                group[i] = await saveDataToFirebase[selectedDataTypeOption.value](
                  firebaseGeneService,
                  firebaseGeneReviewService,
                  isGermline,
                  createGene,
                  group[i] as DataRow<GenericDI>,
                );
                break;
              case DataImportType.GENE_GENOMIC_INDICATOR:
                group[i] = await saveDataToFirebase[DataImportType.GENE_GENOMIC_INDICATOR](
                  firebaseGeneService,
                  isGermline,
                  createGene,
                  group[i] as DataRow<GenomicIndicatorDI>,
                );
                break;
              case DataImportType.SOMATIC_MUTATION:
              case DataImportType.GERMLINE_MUTATION:
                group[i] = await saveDataToFirebase[selectedDataTypeOption.value](
                  authStore,
                  firebaseGeneService,
                  firebaseMetaService,
                  alterationStore,
                  isGermline,
                  createGene,
                  group[i],
                  mutations,
                  vus,
                );
                break;
              default:
                break;
            }
          }
        } else {
          group.forEach(row => {
            row.status = status.status;
            row.message = status.message;
          });
        }
      }
      setFileRows(_.flatten(_.values(geneGroups)));

      setImportStatus('imported');
    };

    const getTableColumns = () => {
      const columns: SearchColumn<DataImportObj>[] = [
        {
          disableHeaderFiltering: true,
          accessor: ROW_COLUMN_KEY,
          Header: 'Row #',
          maxWidth: 60,
        },
      ];
      if (importStatus === 'imported') {
        columns.push({
          disableHeaderFiltering: true,
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
            disableHeaderFiltering: true,
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
            <div className={'d-flex flex-wrap align-items-center'}>
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
                className={'mb-2'}
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
                value={selectedDataTypeOption}
                options={getSelectOptions(isGermline)}
                className={'mb-2 me-2'}
                onChange={option => setSelectedDateTypeOption(option)}
                isClearable
                placeholder={'Select data type to import'}
              ></Select>
              <div className={'mb-2 nowrap'}>
                <Input
                  type="checkbox"
                  name="createGene"
                  id={'DI-createGene'}
                  value="Error"
                  checked={createGene}
                  onClick={() => setCreateGene(!createGene)}
                />
                <Label check for={'DI-createGene'} className={'ms-1'}>
                  Create gene if not exist
                </Label>
              </div>
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
  },
);

const mapStoreToProps = ({
  authStore,
  firebaseGeneService,
  firebaseGeneReviewService,
  firebaseMetaService,
  alterationStore,
}: IRootStore) => ({
  authStore,
  firebaseGeneService,
  firebaseGeneReviewService,
  firebaseMetaService,
  alterationStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationDataImportTab);
