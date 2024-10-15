import { Mutation, VusObjList } from 'app/shared/model/firebase/firebase.model';
import { action, computed, flow, flowResult, makeObservable, observable } from 'mobx';
import { convertEntityStatusAlterationToAlterationData, getFullAlterationName, hasValue, parseAlterationName } from 'app/shared/util/utils';
import _ from 'lodash';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { AlterationAnnotationStatus, AnnotateAlterationBody, Gene, Alteration as ApiAlteration } from 'app/shared/api/generated/curation';
import { REFERENCE_GENOME } from 'app/config/constants/constants';
import AlterationStore from 'app/entities/alteration/alteration.store';
import { IGene } from 'app/shared/model/gene.model';
import { IFlag } from 'app/shared/model/flag.model';
import { AlterationData } from '../AddMutationModal';

type SelectedFlag = IFlag | Omit<IFlag, 'id'>;

export class AddMutationModalStore {
  private alterationStore: AlterationStore;

  public geneEntity: IGene | null = null;
  public mutationToEdit: Mutation | null = null;
  public vusList: VusObjList | null = null;
  public alterationStates: AlterationData[] = [];

  public selectedAlterationStateIndex = -1;
  public selectedExcludedAlterationIndex = -1;

  public showModifyExonForm = false;

  public isFetchingAlteration = false;
  public isFetchingExcludingAlteration = false;

  public selectedAlterationCategoryFlags: SelectedFlag[] = [];
  public alterationCategoryComment: string = '';

  constructor(alterationStore: AlterationStore) {
    this.alterationStore = alterationStore;
    makeObservable(this, {
      geneEntity: observable,
      mutationToEdit: observable,
      vusList: observable,
      alterationStates: observable,
      selectedAlterationStateIndex: observable,
      selectedExcludedAlterationIndex: observable,
      showModifyExonForm: observable,
      isFetchingAlteration: observable,
      isFetchingExcludingAlteration: observable,
      selectedAlterationCategoryFlags: observable,
      alterationCategoryComment: observable,
      currentMutationNames: computed,
      updateAlterationStateAfterAlterationAdded: action.bound,
      updateAlterationStateAfterExcludedAlterationAdded: action.bound,
      setMutationToEdit: action.bound,
      setVusList: action.bound,
      setGeneEntity: action.bound,
      setShowModifyExonForm: action.bound,
      setAlterationStates: action.bound,
      setSelectedAlterationStateIndex: action.bound,
      setSelectedExcludedAlterationIndex: action.bound,
      setSelectedAlterationCategoryFlags: action.bound,
      setAlterationCategoryComment: action.bound,
      handleAlterationChange: action.bound,
      handleExcludedAlterationChange: action.bound,
      handleExcludingFieldChange: action.bound,
      fetchExcludedAlteration: action.bound,
      handleNormalAlterationChange: action.bound,
      handleNormalFieldChange: action.bound,
      fetchNormalAlteration: action.bound,
      filterAlterationsAndNotify: action.bound,
      fetchAlteration: action.bound,
      fetchAlterations: action.bound,
      cleanup: action.bound,
    });
  }

  setMutationToEdit(mutationtoEdit: Mutation | null) {
    this.mutationToEdit = mutationtoEdit;
  }

  setVusList(vusList: VusObjList | null) {
    this.vusList = vusList;
  }

  setGeneEntity(geneEntity: IGene | null) {
    this.geneEntity = geneEntity;
  }

  setShowModifyExonForm(show: boolean) {
    this.showModifyExonForm = show;
    this.selectedAlterationStateIndex = -1;
  }

  setAlterationStates(newAlterationStates: AlterationData[]) {
    this.alterationStates = newAlterationStates;
  }

  setSelectedAlterationStateIndex(index: number) {
    this.selectedAlterationStateIndex = index;
  }

  setSelectedExcludedAlterationIndex(index: number) {
    this.selectedExcludedAlterationIndex = index;
  }

  setSelectedAlterationCategoryFlags(flags: SelectedFlag[]) {
    this.selectedAlterationCategoryFlags = flags;
  }

  setAlterationCategoryComment(comment: string) {
    this.alterationCategoryComment = comment;
  }

  get currentMutationNames() {
    return this.alterationStates.map(state => getFullAlterationName({ ...state, comment: '' }).toLowerCase()).sort();
  }

  async updateAlterationStateAfterAlterationAdded(parsedAlterations: ReturnType<typeof parseAlterationName>, isUpdate = false) {
    const newParsedAlteration = this.filterAlterationsAndNotify(parsedAlterations) ?? [];

    if (newParsedAlteration.length === 0) {
      return;
    }

    const newEntityStatusAlterationsPromise = this.fetchAlterations(newParsedAlteration.map(alt => alt.alteration)) ?? [];
    const newEntityStatusExcludingAlterationsPromise = this.fetchAlterations(newParsedAlteration[0].excluding) ?? [];
    const [newEntityStatusAlterations, newEntityStatusExcludingAlterations] = await Promise.all([
      newEntityStatusAlterationsPromise,
      newEntityStatusExcludingAlterationsPromise,
    ]);

    const newExcludingAlterations = newEntityStatusExcludingAlterations.map((alt, index) =>
      convertEntityStatusAlterationToAlterationData(alt, newParsedAlteration[0].excluding[index], [], ''),
    );
    const newAlterations = newEntityStatusAlterations.map((alt, index) =>
      convertEntityStatusAlterationToAlterationData(
        alt,
        newParsedAlteration[index].alteration,
        _.cloneDeep(newExcludingAlterations),
        newParsedAlteration[index].comment,
        newParsedAlteration[index].name,
      ),
    );

    if (isUpdate) {
      const newAlterationStates = _.cloneDeep(this.alterationStates);
      newAlterationStates[this.selectedAlterationStateIndex] = newAlterations[0];
      this.alterationStates = newAlterationStates;
    } else {
      this.alterationStates = this.alterationStates.concat(newAlterations);
    }
  }

  async updateAlterationStateAfterExcludedAlterationAdded(parsedAlterations: ReturnType<typeof parseAlterationName>) {
    const currentState = this.alterationStates[this.selectedAlterationStateIndex];
    const alteration = currentState.alteration.toLowerCase();
    let excluding = currentState.excluding.map(ex => ex.alteration.toLowerCase());
    excluding.push(...parsedAlterations.map(alt => alt.alteration.toLowerCase()));
    excluding = excluding.sort();

    if (
      this.alterationStates.some(
        state =>
          state.alteration.toLowerCase() === alteration &&
          _.isEqual(state.excluding.map(ex => ex.alteration.toLowerCase()).sort(), excluding),
      )
    ) {
      notifyError(new Error('Duplicate alteration(s) removed'));
      return;
    }

    const newComment = parsedAlterations[0].comment;
    const newVariantName = parsedAlterations[0].name;

    const newEntityStatusAlterations = await this.fetchAlterations(parsedAlterations.map(alt => alt.alteration));

    const newAlterations = newEntityStatusAlterations.map((alt, index) =>
      convertEntityStatusAlterationToAlterationData(alt, parsedAlterations[index].alteration, [], newComment, newVariantName),
    );

    const newAlterationStates = _.cloneDeep(this.alterationStates);
    newAlterationStates[this.selectedAlterationStateIndex].excluding.push(...newAlterations);
    this.alterationStates = newAlterationStates;
  }

  async handleAlterationChange(newValue: string, alterationIndex: number, excludingIndex?: number, isDebounced = true) {
    if (!_.isNil(excludingIndex)) {
      this.isFetchingExcludingAlteration = true;

      if (isDebounced) {
        this.handleExcludedAlterationChange(newValue);
      } else {
        await this.fetchExcludedAlteration(newValue);
        this.isFetchingExcludingAlteration = false;
      }
    } else {
      this.isFetchingAlteration = true;
      if (isDebounced) {
        this.handleNormalAlterationChange(newValue, alterationIndex);
      } else {
        await this.fetchNormalAlteration(newValue, alterationIndex);
        this.isFetchingAlteration = false;
      }
    }
  }

  handleExcludingFieldChange(newValue: string, field: keyof AlterationData) {
    const newAlterationStates = _.cloneDeep(this.alterationStates);
    newAlterationStates[this.selectedAlterationStateIndex].excluding[this.selectedExcludedAlterationIndex][field as string] = newValue;
    this.alterationStates = newAlterationStates;
  }

  async fetchExcludedAlteration(newAlteration: string) {
    const alterationIndex = this.selectedAlterationStateIndex;
    const excludingIndex = this.selectedExcludedAlterationIndex;
    const newParsedAlteration = parseAlterationName(newAlteration);

    const currentState = this.alterationStates[alterationIndex];
    const alteration = currentState.alteration.toLowerCase();
    let excluding: string[] = [];
    for (let i = 0; i < currentState.excluding.length; i++) {
      if (i === excludingIndex) {
        excluding.push(...newParsedAlteration.map(alt => alt.alteration.toLowerCase()));
      } else {
        excluding.push(currentState.excluding[excludingIndex].alteration.toLowerCase());
      }
    }
    excluding = excluding.sort();
    if (
      this.alterationStates.some(
        state =>
          state.alteration.toLowerCase() === alteration &&
          _.isEqual(state.excluding.map(ex => ex.alteration.toLowerCase()).sort(), excluding),
      )
    ) {
      notifyError(new Error('Duplicate alteration(s) removed'));
      const newAlterationStates = _.cloneDeep(this.alterationStates);
      newAlterationStates[alterationIndex].excluding.splice(excludingIndex, 1);
      this.alterationStates = newAlterationStates;
      return;
    }

    const alterationPromises: Promise<AlterationAnnotationStatus | undefined>[] = [];
    let newAlterations: AlterationData[] = [];
    if (newParsedAlteration[0].alteration !== this.alterationStates[alterationIndex]?.excluding[excludingIndex].alteration) {
      alterationPromises.push(this.fetchAlteration(newParsedAlteration[0].alteration));
    } else {
      newAlterations.push(this.alterationStates[alterationIndex].excluding[excludingIndex]);
    }

    for (let i = 1; i < newParsedAlteration.length; i++) {
      alterationPromises.push(this.fetchAlteration(newParsedAlteration[i].alteration));
    }
    newAlterations = [
      ...newAlterations,
      ...(await Promise.all(alterationPromises))
        .map((alt, index) =>
          alt
            ? convertEntityStatusAlterationToAlterationData(
                alt,
                newParsedAlteration[index].alteration,
                [],
                newParsedAlteration[index].comment,
              )
            : undefined,
        )
        .filter(hasValue),
    ];

    const newAlterationStates = _.cloneDeep(this.alterationStates);
    newAlterationStates[alterationIndex].excluding.splice(excludingIndex, 1, ...newAlterations);
    this.alterationStates = newAlterationStates;
  }

  handleNormalAlterationChange(newValue: string, alterationIndex: number) {
    const newAlterationStates = _.cloneDeep(this.alterationStates);
    newAlterationStates[alterationIndex].alterationFieldValueWhileFetching = newValue;
    this.alterationStates = newAlterationStates;

    _.debounce(async () => {
      await this.fetchNormalAlteration(newValue, alterationIndex);
      this.isFetchingAlteration = false;
    }, 1000)();
  }

  handleExcludedAlterationChange(newValue: string) {
    const newAlterationStates = _.cloneDeep(this.alterationStates);
    newAlterationStates[this.selectedAlterationStateIndex].excluding[
      this.selectedExcludedAlterationIndex
    ].alterationFieldValueWhileFetching = newValue;
    this.alterationStates = newAlterationStates;

    _.debounce(async () => {
      await this.fetchExcludedAlteration(newValue);
      this.isFetchingExcludingAlteration = false;
    }, 1000)();
  }

  handleNormalFieldChange(newValue: string, field: keyof AlterationData, alterationIndex: number) {
    const newAlterationStates = _.cloneDeep(this.alterationStates);
    newAlterationStates[alterationIndex][field as string] = newValue;
    this.alterationStates = newAlterationStates;
  }

  async fetchNormalAlteration(newAlteration: string, alterationIndex: number) {
    const newParsedAlteration = this.filterAlterationsAndNotify(parseAlterationName(newAlteration), alterationIndex);
    if (newParsedAlteration.length === 0) {
      const newAlterationStates = _.cloneDeep(this.alterationStates);
      newAlterationStates[alterationIndex].alterationFieldValueWhileFetching = undefined;
      this.alterationStates = newAlterationStates;
    }

    const newComment = newParsedAlteration[0].comment;
    const newVariantName = newParsedAlteration[0].name;

    let newExcluding: AlterationData[];
    if (
      _.isEqual(
        newParsedAlteration[0].excluding,
        this.alterationStates[alterationIndex]?.excluding.map(ex => ex.alteration),
      )
    ) {
      newExcluding = this.alterationStates[alterationIndex].excluding;
    } else {
      const excludingEntityStatusAlterations = await this.fetchAlterations(newParsedAlteration[0].excluding);
      newExcluding =
        excludingEntityStatusAlterations?.map((ex, index) =>
          convertEntityStatusAlterationToAlterationData(ex, newParsedAlteration[0].excluding[index], [], ''),
        ) ?? [];
    }

    const alterationPromises: Promise<AlterationAnnotationStatus | undefined>[] = [];
    let newAlterations: AlterationData[] = [];
    if (newParsedAlteration[0].alteration !== this.alterationStates[alterationIndex]?.alteration) {
      alterationPromises.push(this.fetchAlteration(newParsedAlteration[0].alteration));
    } else {
      const newAlterationState = _.cloneDeep(this.alterationStates[alterationIndex]);
      newAlterationState.excluding = newExcluding;
      newAlterationState.comment = newComment;
      newAlterationState.name = newVariantName || newParsedAlteration[0].alteration;
      newAlterations.push(newAlterationState);
    }

    for (let i = 1; i < newParsedAlteration.length; i++) {
      alterationPromises.push(this.fetchAlteration(newParsedAlteration[i].alteration));
    }

    newAlterations = [
      ...newAlterations,
      ...(await Promise.all(alterationPromises))
        .filter(hasValue)
        .map((alt, index) =>
          convertEntityStatusAlterationToAlterationData(
            alt,
            newParsedAlteration[index + newAlterations.length].alteration,
            newExcluding,
            newComment,
            newVariantName,
          ),
        ),
    ];
    newAlterations[0].alterationFieldValueWhileFetching = undefined;

    const newAlterationStates = _.cloneDeep(this.alterationStates);
    newAlterationStates.splice(alterationIndex, 1, ...newAlterations);
    this.alterationStates = newAlterationStates;
  }

  filterAlterationsAndNotify(alterations: ReturnType<typeof parseAlterationName>, alterationIndex?: number) {
    // remove alterations that already exist in modal
    const newAlterations = alterations.filter(alt => {
      return !this.alterationStates.some((state, index) => {
        if (index === alterationIndex) {
          return false;
        }

        const stateName = state.alteration.toLowerCase();
        const stateExcluding = state.excluding.map(ex => ex.alteration.toLowerCase()).sort();
        const altName = alt.alteration.toLowerCase();
        const altExcluding = alt.excluding.map(ex => ex.toLowerCase()).sort();
        return stateName === altName && _.isEqual(stateExcluding, altExcluding);
      });
    });

    if (alterations.length !== newAlterations.length) {
      notifyError(new Error('Duplicate alteration(s) removed'));
    }

    return newAlterations;
  }

  async fetchAlteration(alterationName: string): Promise<AlterationAnnotationStatus | undefined> {
    try {
      const request: AnnotateAlterationBody[] = [
        {
          referenceGenome: REFERENCE_GENOME.GRCH37,
          alteration: { alteration: alterationName, genes: [{ id: this.geneEntity?.id } as Gene] } as ApiAlteration,
        },
      ];
      const alts = await flowResult(flow(this.alterationStore.annotateAlterations)(request));
      return alts[0];
    } catch (error) {
      notifyError(error);
    }
  }

  async fetchAlterations(alterationNames: string[]) {
    try {
      const alterationPromises = alterationNames.map(name => this.fetchAlteration(name));
      const alterations = await Promise.all(alterationPromises);
      const filtered: AlterationAnnotationStatus[] = [];
      for (const alteration of alterations) {
        if (alteration !== undefined) {
          filtered.push(alteration);
        }
      }
      return filtered;
    } catch (error) {
      notifyError(error);
      return [];
    }
  }

  cleanup() {
    this.geneEntity = null;
    this.mutationToEdit = null;
    this.vusList = null;
    this.alterationStates = [];
    this.selectedAlterationStateIndex = -1;
    this.selectedExcludedAlterationIndex = -1;
    this.showModifyExonForm = false;
    this.isFetchingAlteration = false;
    this.isFetchingExcludingAlteration = false;
    this.selectedAlterationCategoryFlags = [];
    this.alterationCategoryComment = '';
  }
}
