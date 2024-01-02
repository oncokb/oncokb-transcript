import { PAGE_ROUTE } from 'app/config/constants/constants';
import { Gene, Meta } from 'app/shared/model/firebase/firebase.model';
import GeneSelect from 'app/shared/select/GeneSelect';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useEffect, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Col, Row } from 'reactstrap';
import './curation-tools-tab.scss';

function CurationToolsTab({ addMetaListener, metaData, createMetaGene, createGene }: StoreProps) {
  const [selectedGene, setSelectedGene] = useState<string>(null);
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);

  useEffect(() => {
    const callback = addMetaListener();

    return () => callback && callback();
  }, []);

  useEffect(() => {
    if (selectedGene && !Object.keys(metaData).includes(selectedGene)) {
      setCreateButtonDisabled(false);
    } else {
      setCreateButtonDisabled(true);
    }
  }, [selectedGene]);

  async function handleCreateGene() {
    const gene = new Gene(selectedGene);
    await Promise.all([
      createGene(getFirebasePath('GENE', gene.name), gene),
      createMetaGene(getFirebasePath('META_GENE', gene.name), new Meta()),
    ]);
    window.location.href = `${PAGE_ROUTE.CURATION}/${gene.name}`;
  }

  return (
    <div>
      <Row className="mb-2">
        <Col className="px-0">
          <h6>Curate New Gene</h6>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col className="px-0">
          <GeneSelect onChange={option => setSelectedGene(option?.label)} />
        </Col>
      </Row>
      <Row className={`align-items-center ${createButtonDisabled && selectedGene ? 'justify-content-between' : 'justify-content-end'}`}>
        {createButtonDisabled && selectedGene && (
          <div className="gene-exists-warning mr-2">
            <FaExclamationCircle className="mr-2" size={'25px'} color="danger" />
            <span>Gene already exists</span>
          </div>
        )}
        <Button color="primary" disabled={createButtonDisabled} onClick={handleCreateGene}>
          Create
        </Button>
      </Row>
    </div>
  );
}

const mapStoreToProps = ({ firebaseMetaStore, firebaseGeneStore }: IRootStore) => ({
  addMetaListener: firebaseMetaStore.addMetaListListener,
  metaData: firebaseMetaStore.metaList,
  createMetaGene: firebaseMetaStore.create,
  createGene: firebaseGeneStore.create,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationToolsTab);
