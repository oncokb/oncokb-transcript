import { Gene, Meta } from 'app/shared/model/firebase/firebase.model';
import GeneSelect from 'app/shared/select/GeneSelect';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'reactstrap';

/* eslint-disable no-console */
function CurateGeneTab({ addMetaListener, metaData, createMetaGene, createGene }: StoreProps) {
  const [selectedGene, setSelectedGene] = useState<string>(null);
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);

  useEffect(() => {
    const callback = addMetaListener();

    return () => callback && callback();
  }, []);

  useEffect(() => {
    if (!selectedGene || Object.keys(metaData).includes(selectedGene)) {
      setCreateButtonDisabled(true);
    } else {
      setCreateButtonDisabled(false);
    }
  }, [selectedGene]);

  async function handleCreateGene() {
    await createGene(getFirebasePath('GENE', selectedGene), new Gene(selectedGene));
  }

  return (
    <Container>
      <Row>
        <Col>
          <GeneSelect onChange={option => setSelectedGene(option?.label)} />
        </Col>
      </Row>
      <Row>
        <Col>Hi</Col>
      </Row>
      <Row>
        <Button color="primary" disabled={createButtonDisabled} onClick={handleCreateGene}>
          Create
        </Button>
      </Row>
    </Container>
  );
}

const mapStoreToProps = ({ firebaseMetaStore, firebaseGeneStore }: IRootStore) => ({
  addMetaListener: firebaseMetaStore.addMetaListListener,
  metaData: firebaseMetaStore.metaList,
  createMetaGene: firebaseMetaStore.create,
  createGene: firebaseGeneStore.create,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurateGeneTab);
