import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';

export class CommentStore {
  public openCommentsId: string = null;
  public openCommentsScrollPosition: number = null;
  public commentIndiciesToDelete: number[] = [];
  public commentInputValue = '';

  constructor() {
    makeObservable(this, {
      openCommentsId: observable,
      openCommentsScrollPosition: observable,
      commentIndiciesToDelete: observable,
      commentInputValue: observable,
      addCommentToDeleteIndex: action.bound,
      removeIndexToDelete: action.bound,
      clearCommentsToDelete: action.bound,
      setCommentInputValue: action.bound,
    });
  }

  addCommentToDeleteIndex(index: number) {
    this.commentIndiciesToDelete.push(index);
  }

  removeIndexToDelete(index: number) {
    _.remove(this.commentIndiciesToDelete, commentIndex => commentIndex === index);
  }

  clearCommentsToDelete() {
    this.commentIndiciesToDelete = [];
  }

  setOpenCommentsId(id: string) {
    this.openCommentsId = id;
  }

  setOpenCommentsScrollPosition(position: number) {
    this.openCommentsScrollPosition = position;
  }

  setCommentInputValue(value: string) {
    this.commentInputValue = value;
  }
}
