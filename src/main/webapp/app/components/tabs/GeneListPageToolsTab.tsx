import { CURATE_NEW_GENE_TEXT, PAGE_ROUTE } from 'app/config/constants/constants';
import { Gene, Meta } from 'app/shared/model/firebase/firebase.model';
import GeneSelect from 'app/shared/select/GeneSelect';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useEffect, useRef, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Col, Row } from 'reactstrap';
import './curation-tools-tab.scss';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { isPromiseOk } from 'app/shared/util/utils';
import { getErrorMessage } from 'app/oncokb-commons/components/alert/ErrorAlertUtils';
import { observer } from 'mobx-react';

function GeneListPageToolsTab({ addMetaListener, metaData, createMetaGene, deleteMetaGene, createGene, deleteGene }: StoreProps) {
  const selectedGene = useRef<string>(null);
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const [showGeneExistsWarning, setShowGeneExistsWarning] = useState(false);

  useEffect(() => {
    const callback = addMetaListener();

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
    const gene = new Gene(selectedGene.current);

    const genePath = getFirebasePath('GENE', gene.name);
    const metaGenePath = getFirebasePath('META_GENE', gene.name);
    const results = await Promise.all([isPromiseOk(createGene(genePath, gene)), isPromiseOk(createMetaGene(metaGenePath, new Meta()))]);

    if (results[0].ok && results[1].ok) {
      // both succeeded
      window.location.href = `${PAGE_ROUTE.CURATION}/${gene.name}`;
    } else if (results[0].ok && !results[1].ok) {
      // createMetaGene failed
      notifyError(results[1].error);
      deleteGene(genePath);
    } else if (results[1].ok && !results[0].ok) {
      // createGene failed
      notifyError(results[0].error);
      deleteMetaGene(metaGenePath);
    } else {
      // both failed
      notifyError(new Error(`Errors: ${getErrorMessage(results[0].error)}, ${getErrorMessage(results[1].error)}`));
    }
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
  deleteMetaGene: firebaseMetaStore.delete,
  createGene: firebaseGeneStore.create,
  deleteGene: firebaseGeneStore.delete,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GeneListPageToolsTab));
