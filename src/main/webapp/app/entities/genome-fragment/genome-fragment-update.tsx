import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';

import { SaveButton } from 'app/shared/button/SaveButton';

export interface IGenomeFragmentUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomeFragmentUpdate = (props: IGenomeFragmentUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const seqRegions = props.seqRegions;
  const transcripts = props.transcripts;
  const genomeFragmentEntity = props.genomeFragmentEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push('/genome-fragment' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getSeqRegions({});
    props.getTranscripts({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  // TYPE-ISSUE: Not sure what type values is
  const saveEntity = values => {
    const entity = {
      ...genomeFragmentEntity,
      ...values,
      seqRegion: seqRegions.find(it => it.id?.toString() === values.seqRegionId.toString()),
      transcript: transcripts.find(it => it.id?.toString() === values.transcriptId.toString()),
    };

    if (isNew) {
      props.createEntity(entity);
    } else {
      props.updateEntity(entity);
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          type: 'GENE',
          ...genomeFragmentEntity,
          seqRegionId: genomeFragmentEntity?.seqRegion?.id,
          transcriptId: genomeFragmentEntity?.transcript?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.genomeFragment.home.createOrEditLabel" data-cy="GenomeFragmentCreateUpdateHeading">
            Add or edit a GenomeFragment
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? (
                <ValidatedField name="id" required readOnly id="genome-fragment-id" label="ID" validate={{ required: true }} />
              ) : null}
              <ValidatedField label="Start" id="genome-fragment-start" name="start" data-cy="start" type="text" />
              <ValidatedField label="End" id="genome-fragment-end" name="end" data-cy="end" type="text" />
              <ValidatedField label="Strand" id="genome-fragment-strand" name="strand" data-cy="strand" type="text" />
              <ValidatedField label="Type" id="genome-fragment-type" name="type" data-cy="type" type="select">
                <option value="GENE">GENE</option>
                <option value="EXON">EXON</option>
                <option value="FIVE_PRIME_UTR">FIVE_PRIME_UTR</option>
                <option value="THREE_PRIME_UTR">THREE_PRIME_UTR</option>
              </ValidatedField>
              <ValidatedField id="genome-fragment-seqRegion" name="seqRegionId" data-cy="seqRegion" label="Seq Region" type="select">
                <option value="" key="0" />
                {seqRegions
                  ? seqRegions.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField id="genome-fragment-transcript" name="transcriptId" data-cy="transcript" label="Transcript" type="select">
                <option value="" key="0" />
                {transcripts
                  ? transcripts.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  seqRegions: storeState.seqRegionStore.entities,
  transcripts: storeState.transcriptStore.entities,
  genomeFragmentEntity: storeState.genomeFragmentStore.entity,
  loading: storeState.genomeFragmentStore.loading,
  updating: storeState.genomeFragmentStore.updating,
  updateSuccess: storeState.genomeFragmentStore.updateSuccess,
  getSeqRegions: storeState.seqRegionStore.getEntities,
  getTranscripts: storeState.transcriptStore.getEntities,
  getEntity: storeState.genomeFragmentStore.getEntity,
  updateEntity: storeState.genomeFragmentStore.updateEntity,
  createEntity: storeState.genomeFragmentStore.createEntity,
  reset: storeState.genomeFragmentStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IGenomeFragmentUpdateProps, StoreProps>(mapStoreToProps)(GenomeFragmentUpdate);
