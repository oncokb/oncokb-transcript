import { CURATE_NEW_GENE_TEXT, DEFAULT_ICON_SIZE, PAGE_ROUTE } from 'app/config/constants/constants';
import { FB_COLLECTION } from 'app/config/constants/firebase';
import GeneSelect from 'app/shared/select/GeneSelect';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Col, Row } from 'reactstrap';
import './curation-tools-tab.scss';

function GeneListPageToolsTab({ addMetaListener, metaData, createGene }: StoreProps) {
  const selectedGene = useRef<string>(null);
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const [showGeneExistsWarning, setShowGeneExistsWarning] = useState(false);

  useEffect(() => {
    const callback = addMetaListener(FB_COLLECTION.META);

    return () => callback && callback();
  }, []);

  function handleChangeSelectedGene(option) {
    const gene = option?.label;
    selectedGene.current = gene;

    if (!gene) {
      setCreateButtonDisabled(true);
      setShowGeneExistsWarning(false);
    } else if (Object.keys(metaData).includes(gene)) {
      setCreateButtonDisabled(true);
      setShowGeneExistsWarning(true);
    } else {
      setCreateButtonDisabled(false);
      setShowGeneExistsWarning(false);
    }
  }

  async function handleCreateGene() {
    createGene(selectedGene.current, false, `${PAGE_ROUTE.CURATION}/${selectedGene.current}/somatic`);
  }

  return (
    <div>
      <Row className="mb-2">
        <Col className="px-0">
          <h6>{CURATE_NEW_GENE_TEXT}</h6>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col className="px-0">
          <GeneSelect onChange={handleChangeSelectedGene} />
        </Col>
      </Row>
      <Row className={`align-items-center ${showGeneExistsWarning ? 'justify-content-between' : 'justify-content-end'}`}>
        {showGeneExistsWarning && (
          <div className="error-message mr-2">
            <FaExclamationCircle className="mr-2" size={DEFAULT_ICON_SIZE} color="danger" />
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

const mapStoreToProps = ({ firebaseMetaStore, firebaseGeneService }: IRootStore) => ({
  addMetaListener: firebaseMetaStore.addListener,
  metaData: firebaseMetaStore.data,
  createGene: firebaseGeneService.createGene,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GeneListPageToolsTab));
