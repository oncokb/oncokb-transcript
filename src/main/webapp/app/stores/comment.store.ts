import { Comment } from 'app/shared/model/firebase/firebase.model';
import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';

export class CommentStore {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public openCommentsId: string = null;
  public comments: Comment[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public openCommentsScrollPosition: number = null;
  public commentIndiciesToDelete: number[] = [];
  public commentInputValue = '';

  constructor() {
    makeObservable(this, {
      openCommentsId: observable,
      comments: observable,
      openCommentsScrollPosition: observable,
      commentIndiciesToDelete: observable,
      commentInputValue: observable,
      setComments: action.bound,
      addCommentToDeleteIndex: action.bound,
      removeIndexToDelete: action.bound,
      clearCommentsToDelete: action.bound,
      setCommentInputValue: action.bound,
    });
  }

  setComments(comments: Comment[]) {
    this.comments = comments;
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
