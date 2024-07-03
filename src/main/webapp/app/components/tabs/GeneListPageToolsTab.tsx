import { CURATE_NEW_GENE_TEXT, DEFAULT_ICON_SIZE, PAGE_ROUTE } from 'app/config/constants/constants';
import GeneSelect from 'app/shared/select/GeneSelect';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { Button } from 'reactstrap';
import './curation-tools-tab.scss';
import { MetaCollection } from 'app/shared/model/firebase/firebase.model';

export interface IGeneListPageToolsTab extends StoreProps {
  metaData: MetaCollection;
}

function GeneListPageToolsTab({ metaData, createGene }: IGeneListPageToolsTab) {
  const selectedGene = useRef<string>(null);
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const [showGeneExistsWarning, setShowGeneExistsWarning] = useState(false);

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
    await createGene(selectedGene.current, false, `${PAGE_ROUTE.CURATION}/${selectedGene.current}/somatic`);
  }

  return (
    <div>
      <h6 className="mb-2">{CURATE_NEW_GENE_TEXT}</h6>
      <div className="mb-2">
        <GeneSelect onChange={handleChangeSelectedGene} />
      </div>
      <div className={`d-flex align-items-center ${showGeneExistsWarning ? 'justify-content-between' : 'justify-content-end'}`}>
        {showGeneExistsWarning && (
          <div className="error-message me-2">
            <FaExclamationCircle className="me-2" size={DEFAULT_ICON_SIZE} color="danger" />
            <span>Gene already exists</span>
          </div>
        )}
        <Button color="primary" disabled={createButtonDisabled} onClick={handleCreateGene}>
          Create
        </Button>
      </div>
    </div>
  );
}

const mapStoreToProps = ({ firebaseGeneService }: IRootStore) => ({
  createGene: firebaseGeneService.createGene,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(GeneListPageToolsTab));
