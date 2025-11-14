import { makeAutoObservable, action, observable } from 'mobx';
import { IRootStore } from './createStore';
import { IAssociation } from 'app/shared/model/association.model';

export class CdxAssociationEditStore {
  editingAssociation: IAssociation | null = null;

  constructor(protected rootStore: IRootStore) {
    makeAutoObservable(this, {
      editingAssociation: observable,
      setEditingAssociation: action.bound,
      clear: action.bound,
    });
  }

  setEditingAssociation(association: IAssociation | null) {
    this.editingAssociation = association;
  }

  clear() {
    this.editingAssociation = null;
  }
}

export default CdxAssociationEditStore;
