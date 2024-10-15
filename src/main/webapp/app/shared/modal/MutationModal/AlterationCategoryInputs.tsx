import React, { useEffect, useMemo, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Col, Row } from 'reactstrap';
import { IFlag } from 'app/shared/model/flag.model';
import { FlagTypeEnum } from 'app/shared/model/enumerations/flag-type.enum.model';
import { AlterationCategories } from 'app/shared/model/firebase/firebase.model';
import { isFlagEqualToIFlag } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { DropdownOption } from './AddMutationModalDropdown';

const AlterationCategoryInputs = ({
  getFlagsByType,
  alterationCategoryFlagEntities,
  mutationToEdit,
  setSelectedAlterationCategoryFlags,
  selectedAlterationCategoryFlags,
  setAlterationCategoryComment,
}: StoreProps) => {
  const [alterationCategories, setAlterationCategories] = useState<AlterationCategories | null>(null);

  useEffect(() => {
    getFlagsByType?.(FlagTypeEnum.ALTERATION_CATEGORY);

    setAlterationCategories(mutationToEdit?.alteration_categories ?? null);
  }, [mutationToEdit]);

  useEffect(() => {
    if (alterationCategoryFlagEntities) {
      setSelectedAlterationCategoryFlags?.(
        alterationCategories?.flags?.reduce((acc: IFlag[], flag) => {
          const matchedFlag = alterationCategoryFlagEntities.find(flagEntity => isFlagEqualToIFlag(flag, flagEntity));

          if (matchedFlag) {
            acc.push(matchedFlag);
          }

          return acc;
        }, []) ?? [],
      );
    }
    setAlterationCategoryComment?.(alterationCategories?.comment ?? '');
  }, [alterationCategories, alterationCategoryFlagEntities]);

  const flagDropdownOptions = useMemo(() => {
    if (!alterationCategoryFlagEntities) return [];
    return alterationCategoryFlagEntities.map(flag => ({ label: flag.name, value: flag }));
  }, [alterationCategoryFlagEntities]);

  const handleMutationFlagAdded = (newFlagName: string) => {
    // The flag name entered by user can be converted to flag by remove any non alphanumeric characters
    const newFlagFlag = newFlagName
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, '_')
      .toUpperCase();
    const newSelectedFlag: Omit<IFlag, 'id'> = {
      type: FlagTypeEnum.ALTERATION_CATEGORY,
      flag: newFlagFlag,
      name: newFlagName,
      description: '',
      alterations: null,
      articles: null,
      drugs: null,
      genes: null,
      transcripts: null,
    };
    setSelectedAlterationCategoryFlags?.([...(selectedAlterationCategoryFlags ?? []), newSelectedFlag]);
  };

  const handleAlterationCategoriesField = (field: keyof AlterationCategories, value: unknown) => {
    if (field === 'comment') {
      setAlterationCategoryComment?.(value as string);
    } else if (field === 'flags') {
      const flagOptions = value as DropdownOption[];
      setSelectedAlterationCategoryFlags?.(flagOptions.map(option => option.value));
    }
  };

  return (
    <>
      <Row>
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Col className="px-0 col-3">
              <span>String Name</span>
            </Col>
            <Col className="px-0">
              <CreatableSelect
                inputId="add-mutation-modal-flag-input"
                isMulti
                options={flagDropdownOptions}
                onChange={newFlags => handleAlterationCategoriesField('flags', newFlags)}
                onCreateOption={handleMutationFlagAdded}
                value={selectedAlterationCategoryFlags?.map(newFlag => ({ label: newFlag.name, value: newFlag }))}
              />
            </Col>
          </div>
        </Col>
      </Row>
    </>
  );
};

const mapStoreToProps = ({ flagStore, addMutationModalStore }: IRootStore) => ({
  getFlagsByType: flagStore.getFlagsByType,
  createFlagEntity: flagStore.createEntity,
  alterationCategoryFlagEntities: flagStore.alterationCategoryFlags,
  mutationToEdit: addMutationModalStore.mutationToEdit,
  setSelectedAlterationCategoryFlags: addMutationModalStore.setSelectedAlterationCategoryFlags,
  selectedAlterationCategoryFlags: addMutationModalStore.selectedAlterationCategoryFlags,
  setAlterationCategoryComment: addMutationModalStore.setAlterationCategoryComment,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AlterationCategoryInputs);
