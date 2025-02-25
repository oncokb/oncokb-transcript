import { CommentList } from 'app/shared/model/firebase/firebase.model';
import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';

export class CommentStore {
  public openCommentsId: string | null = null;
  public comments: CommentList = {};
  public openCommentsScrollPosition: number | null = null;
  public commentKeysToDelete: string[] = [];
  public commentInputValue = '';

  constructor() {
    makeObservable(this, {
      openCommentsId: observable,
      comments: observable,
      openCommentsScrollPosition: observable,
      commentKeysToDelete: observable,
      commentInputValue: observable,
      setComments: action.bound,
      addCommentKeyToDelete: action.bound,
      removeKeyToDelete: action.bound,
      clearCommentsToDelete: action.bound,
      setCommentInputValue: action.bound,
    });
  }

  setComments(comments: CommentList) {
    this.comments = comments;
  }

  addCommentKeyToDelete(key: string) {
    if (!this.commentKeysToDelete.includes(key)) {
      this.commentKeysToDelete.push(key);
    }
  }

  removeKeyToDelete(key: string) {
    _.remove(this.commentKeysToDelete, commentKey => commentKey === key);
  }

  clearCommentsToDelete() {
    this.commentKeysToDelete = [];
  }

  setOpenCommentsId(id: string | null) {
    this.openCommentsId = id;
  }

  setOpenCommentsScrollPosition(position: number) {
    this.openCommentsScrollPosition = position;
  }

  setCommentInputValue(value: string) {
    this.commentInputValue = value;
  }
}
