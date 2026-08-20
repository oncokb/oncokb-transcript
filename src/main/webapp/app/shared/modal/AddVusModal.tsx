import React, { useEffect, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { MutationList, VusObjList } from '../model/firebase/firebase.model';
import { getAlterationComparisonName, getFusionPartners, getFusionsWithoutCuratedGene, parseAlterationName } from '../util/utils';
import _ from 'lodash';
import { notifyError, notifyWarning } from 'app/oncokb-commons/components/util/NotificationUtils';
import { DefaultAddMutationModal } from './DefaultAddMutationModal';
import {
  DuplicateMutationInfo,
  PartnerGeneDuplicateInfo,
  getDuplicateMutations,
  getFirebaseGenePath,
  getPartnerGeneDuplicates,
} from '../util/firebase/firebase-utils';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { onValue, ref, get } from 'firebase/database';
import { Button, Col, Row } from 'reactstrap';
import { GroupBase } from 'react-select';
import Select from 'react-select/dist/declarations/src/Select';
import { alterationControllerClient } from '../api/clients';
import { AnnotateAlterationBody, Alteration as ApiAlteration, Gene as ApiGene } from 'app/shared/api/generated/curation';
import { REFERENCE_GENOME } from 'app/config/constants/constants';

export interface IAddVusModalProps extends StoreProps {
  hugoSymbol: string | undefined;
  isGermline: boolean;
  vusList: VusObjList | null;
  onCancel: () => void;
  onConfirm: (variants: string[]) => Promise<void>;
  convertOptions?: {
    initialAlterations: string[];
    mutationUuid: string;
    isConverting: boolean;
  };
}

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

const AddVusModal = (props: IAddVusModalProps) => {
  const firebaseMutationPath = `${getFirebaseGenePath(props.isGermline, props.hugoSymbol)}/mutations`;
  const [mutationList, setMutationList] = useState<MutationList>();
  const [duplicateAlterations, setDuplicateAlterations] = useState<DuplicateMutationInfo[]>([]);
  const [partnerGeneDuplicates, setPartnerGeneDuplicates] = useState<PartnerGeneDuplicateInfo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [variants, setVariants] = useState<readonly Option[]>([]);

  // need to focus input once this is fetched
  const [mutationListInitialized, setMutationListInitialized] = useState(false);

  const inputRef = useRef<Select<Option, true, GroupBase<Option>> | null>(null);

  useEffect(() => {
    if (!props.firebaseDb) {
      return;
    }
    const subscribe = onValue(ref(props.firebaseDb, firebaseMutationPath), snapshot => {
      setMutationList(snapshot.val());
      if (!mutationListInitialized) {
        setMutationListInitialized(true);
      }
    });
    return () => subscribe();
  }, []);

  useEffect(() => {
    if (mutationList) {
      const dupAlts = getDuplicateMutations(
        variants.map(o => o.label),
        mutationList,
        `${getFirebaseGenePath(props.isGermline, props.hugoSymbol)}/mutations`,
        props.vusList ?? {},
        { useFullAlterationName: false, exact: false, excludedMutationUuid: props.convertOptions?.mutationUuid },
      );
      setDuplicateAlterations(dupAlts);
    }
  }, [variants, mutationList, props.vusList]);

  useEffect(() => {
    if (!props.firebaseDb) {
      return;
    }
    let isCurrent = true;
    getPartnerGeneDuplicates(
      props.firebaseDb,
      props.isGermline,
      props.hugoSymbol,
      variants.map(o => o.label),
    )
      .then(dups => {
        if (isCurrent) {
          setPartnerGeneDuplicates(dups);
        }
      })
      .catch(error => notifyError(error));
    return () => {
      isCurrent = false;
    };
  }, [variants, props.firebaseDb, props.isGermline, props.hugoSymbol]);

  useEffect(() => {
    if (mutationListInitialized) {
      inputRef.current?.focus();
    }
  }, [mutationListInitialized]);

  useEffect(() => {
    handleInitialVariantsAdd();
  }, []);

  async function handleInitialVariantsAdd() {
    for (const initAlt of props.convertOptions?.initialAlterations || []) {
      const filteredAlts = await filterAlterationsAndNotify(initAlt);
      setVariants(state => [...state, ...filteredAlts.map(alt => createOption(alt))]);
    }
  }

  async function handleVariantAdded() {
    const filteredAlterations = await filterAlterationsAndNotify(inputValue);
    setVariants(state => [...state, ...filteredAlterations.map(alt => createOption(alt))]);
    setInputValue('');
  }

  const handleKeyDown = event => {
    if (!inputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
      handleVariantAdded();
      event.preventDefault();
    }
  };

  const filterAlterationsAndNotify = async (variant: string) => {
    const result: string[] = [];
    const alterations = parseAlterationName(variant);
    // should only have a single alteration
    for (const { alteration } of alterations) {
      let isHotspot = false;
      // Fusions are stored using the hugo symbols we have in our database, so the name the annotation gives back is
      // used instead of what was typed. That way BCR-abl1 fusion and the alias ALL-ABL1 Fusion both end up as
      // BCR-ABL1 Fusion. Everything else keeps the curator's name.
      let normalizedAlteration = alteration;
      try {
        const request: AnnotateAlterationBody[] = [
          {
            referenceGenome: REFERENCE_GENOME.GRCH37,
            alteration: { alteration, genes: [{ hugoSymbol: props.hugoSymbol } as ApiGene] } as ApiAlteration,
          },
        ];
        const response = await alterationControllerClient.annotateAlterations(request);
        const annotatedAlteration = response.data[0];
        isHotspot = annotatedAlteration.annotation?.hotspot?.hotspot || false;
        if (getFusionPartners(alteration) && annotatedAlteration.entity?.alteration) {
          normalizedAlteration = annotatedAlteration.entity.alteration;
        }
        if (annotatedAlteration.warning && annotatedAlteration.messages?.length) {
          annotatedAlteration.messages.forEach(message => notifyWarning(new Error(message)));
        }
      } catch (error) {
        notifyError(`Error annotating alteration: ${error}`);
        continue;
      }

      // Fusions are compared on their canonical name so that a swapped gene partner ordering is still a duplicate
      const comparisonName = getAlterationComparisonName(normalizedAlteration);

      const dropdownAlreadyHasVariant = variants.some(({ label }) => {
        return getAlterationComparisonName(label) === comparisonName;
      });

      const vusTableAlreadyHasVariant = Object.values(props.vusList ?? {}).some(({ name }) => {
        return getAlterationComparisonName(name) === comparisonName;
      });

      const alreadyHasVariantInMutationList = Object.values(mutationList ?? {}).some(({ name }) => {
        return getAlterationComparisonName(name) === comparisonName;
      });

      if (dropdownAlreadyHasVariant) {
        notifyError(new Error(`${normalizedAlteration} is already selected. The duplicate alteration(s) was not added.`));
      } else if (vusTableAlreadyHasVariant) {
        notifyError(new Error(`${normalizedAlteration} is already in the VUS table. The duplicate alteration(s) was not added.`));
      } else if (alreadyHasVariantInMutationList) {
        notifyError(new Error(`${normalizedAlteration} is already in the Mutation List. The duplicate alteration(s) was not added.`));
      } else if (isHotspot) {
        notifyError(new Error(`${normalizedAlteration} is a hotspot. The alteration(s) was not added.`));
      } else {
        result.push(normalizedAlteration);
      }
    }
    return result;
  };

  const selectComponent = (
    <CreatableSelect
      ref={inputRef}
      components={{
        DropdownIndicator: null,
      }}
      isMulti
      isClearable={!props.convertOptions?.isConverting}
      isDisabled={props.convertOptions?.isConverting}
      menuIsOpen={false}
      onChange={newValue => setVariants(newValue)}
      onInputChange={(newValue, { action }) => {
        if (action !== 'menu-close' && action !== 'input-blur') {
          setInputValue(newValue);
        }
      }}
      onKeyDown={handleKeyDown}
      placeholder="Enter variant"
      value={variants}
      inputValue={inputValue}
    />
  );

  const errorMessages: string[] = [];
  if (duplicateAlterations.length > 0) {
    const alterationsInMutationList: string[] = [];
    const alterationsInVusList: string[] = [];
    const alterationsInBoth: string[] = [];
    for (const alt of duplicateAlterations) {
      if (alt.inMutationList && alt.inVusList) {
        alterationsInBoth.push(alt.duplicate);
      } else if (alt.inMutationList) {
        alterationsInMutationList.push(alt.duplicate);
      } else if (alt.inVusList) {
        alterationsInVusList.push(alt.duplicate);
      }
    }

    if (alterationsInMutationList.length > 0) {
      errorMessages.push(`${alterationsInMutationList.join(', ')} in mutation list`);
    }
    if (alterationsInVusList.length > 0) {
      errorMessages.push(`${alterationsInVusList.join(', ')} in VUS list`);
    }
    if (alterationsInBoth.length > 0) {
      errorMessages.push(`${alterationsInBoth.join(', ')} in both mutation list and VUS list`);
    }
  }
  const invalidFusions = getFusionsWithoutCuratedGene(
    variants.map(o => o.label),
    props.hugoSymbol,
  );
  for (const fusion of invalidFusions) {
    errorMessages.push(`${fusion} must include ${props.hugoSymbol} as a gene partner because you are curating under ${props.hugoSymbol}`);
  }
  for (const dup of partnerGeneDuplicates) {
    const lists: string[] = [];
    if (dup.inMutationList) {
      lists.push('mutation list');
    }
    if (dup.inVusList) {
      lists.push('VUS list');
    }
    errorMessages.push(`${dup.alteration} is already curated under the ${dup.hugoSymbol} ${lists.join(' and ')}`);
  }

  const getModalBody = () => {
    if (props.convertOptions?.isConverting) {
      return (
        <Row className="align-items-center mb-3">
          <Col>{selectComponent}</Col>
        </Row>
      );
    }
    return (
      <Row className="align-items-center mb-3">
        <Col className="pe-0">{selectComponent}</Col>
        <Col className="col-auto ps-2">
          <Button color="primary" disabled={!inputValue} onClick={handleVariantAdded}>
            Add
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <DefaultAddMutationModal
      modalBody={getModalBody()}
      onCancel={props.onCancel}
      onConfirm={() => props.onConfirm(variants.map(o => o.label))}
      confirmButtonDisabled={
        duplicateAlterations.length > 0 || partnerGeneDuplicates.length > 0 || invalidFusions.length > 0 || variants.length < 1
      }
      errorMessages={errorMessages}
      modalHeader={props.convertOptions?.isConverting ? <div>Demoting Variant(s) to VUS</div> : undefined}
    />
  );
};

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(AddVusModal));
