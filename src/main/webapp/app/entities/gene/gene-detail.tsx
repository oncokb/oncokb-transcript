import React, { useEffect, useState } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import * as styles from './gene.module.scss';
import classnames from 'classnames';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import TranscriptTable from 'app/entities/gene/transcript-table';
import GeneFlags from 'app/entities/gene/gene-flags';
import { ITranscript } from 'app/shared/model/transcript.model';
import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { ClustalOResp } from 'app/shared/api/generated/curation';
import { responseFailure } from 'app/config/notification-middleware-mobx';
import { getGenomicLocation } from 'app/shared/util/utils';

export interface IGeneDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GeneDetail = (props: IGeneDetailProps) => {
  const [ensemblGenes, setEnsemblGenes] = useState<IEnsemblGene[]>([]);
  const [loadingEnsemblGenes, setLoadingEnsemblGenes] = useState(false);

  const [selectedTranscriptIds, setSelectedTranscriptIds] = useState<number[]>([]);
  const [selectedTranscripts, setSelectedTranscripts] = useState<{ [key: number]: ITranscript }>({});

  const [aligningTranscripts, setAligningTranscripts] = useState(false);
  const [alignmentResult, setAlignmentResult] = useState<ClustalOResp>({ clustalo: '', fasta: '', mview: '' });

  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  useEffect(() => {
    if (props.geneEntity.id) {
      setLoadingEnsemblGenes(true);
      props
        .getEnsemblGenes(props.geneEntity.id)
        .then(response => {
          setEnsemblGenes(response.data);
        })
        .catch(responseFailure)
        .finally(() => {
          setLoadingEnsemblGenes(false);
        });
    }
  }, [props.geneEntity.id]);

  const onToggleTranscript = (transcript: ITranscript) => {
    if (transcript.id in selectedTranscripts) {
      delete selectedTranscripts[transcript.id];
      setSelectedTranscriptIds(selectedTranscriptIds.filter(id => id !== transcript.id));
    } else if (transcript.id) {
      selectedTranscripts[transcript.id] = transcript;
      setSelectedTranscriptIds([...selectedTranscriptIds, transcript.id]);
    }
    setSelectedTranscripts(selectedTranscripts);
  };
  const alignSelectedTranscripts = () => {
    setAligningTranscripts(true);
    setAlignmentResult({ clustalo: '', fasta: '' });
    props
      .alignTranscripts(selectedTranscriptIds)
      .then(response => {
        setAlignmentResult(response.data);
      })
      .catch(responseFailure)
      .finally(() => {
        setAligningTranscripts(false);
      });
  };
  const clearSelectedTranscripts = () => {
    setSelectedTranscriptIds([]);
    setSelectedTranscripts({});
  };

  const geneEntity = props.geneEntity;
  return (
    <>
      <Row>
        <Col>
          <div className={'d-flex align-items-center'}>
            <EntityActionButton
              color="primary"
              entityId={geneEntity.id}
              entityType={ENTITY_TYPE.GENE}
              entityAction={ENTITY_ACTION.EDIT}
              showText={false}
            />
            <span className={classnames(styles.header, 'd-flex align-items-baseline')}>
              <span className={'h2'} style={{ marginBottom: 0, marginLeft: 0 }}>
                {geneEntity.hugoSymbol}
              </span>
              <span>Gene ID: {geneEntity.id}</span>
              <span>Entrez Gene ID: {geneEntity.entrezGeneId}</span>
              <span>HGNC ID: {geneEntity.hgncId}</span>
              <span>Gene Synonyms: {(geneEntity.synonyms || []).map(synonym => synonym.name).join(', ')}</span>
            </span>
          </div>
          <div>
            <GeneFlags flags={geneEntity.flags ?? []} />
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className={'mt-3'}>
            {loadingEnsemblGenes && <LoadingIndicator isLoading />}
            {ensemblGenes.map(eg => {
              return (
                <div key={`${eg.referenceGenome}-${eg.ensemblGeneId}`} className={'mb-3'}>
                  <div className={'mb-3'}>
                    <span className={'h4'}>
                      {eg.referenceGenome}: {eg.ensemblGeneId}
                    </span>
                    <span className={'ms-1'}>{getGenomicLocation(eg)}</span>
                  </div>
                  <TranscriptTable
                    ensemblGeneId={eg.id}
                    onToggleTranscript={onToggleTranscript}
                    disableTranscriptAlignment={aligningTranscripts}
                    selectedTranscriptIds={selectedTranscriptIds}
                  />
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className={'d-flex justify-content-end mt-3'}>
            <Button color={'primary'} disabled={selectedTranscriptIds.length < 2 || aligningTranscripts} onClick={alignSelectedTranscripts}>
              Align Selected Transcripts
            </Button>
            {selectedTranscriptIds.length > 0 && (
              <Button color={'primary'} outline className={'ms-2'} onClick={clearSelectedTranscripts}>
                Clear Selection
              </Button>
            )}
          </div>
          <div>
            <LoadingIndicator isLoading={aligningTranscripts} className={'d-flex flex-column align-items-center'}>
              <span className={'ms-2'}>Loading alignment result for selected transcripts</span>
            </LoadingIndicator>
          </div>
          {alignmentResult.mview && <iframe style={{ border: 0, height: '100vh' }} width={'100%'} srcDoc={alignmentResult.mview}></iframe>}
        </Col>
      </Row>
    </>
  );
};

const mapStoreToProps = ({ geneStore }: IRootStore) => ({
  geneEntity: geneStore.entity,
  getEntity: geneStore.getEntity,
  getEnsemblGenes: geneStore.getEnsemblGenes,
  alignTranscripts: geneStore.alignTranscripts,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneDetail);
