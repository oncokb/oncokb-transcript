import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Comment } from 'app/shared/model/firebase/firebase.model';
import { Button, Col, Container, Input, InputGroup, ListGroup, ListGroupItem, Row } from 'reactstrap';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { APP_DATETIME_FORMAT, CLOSE_TOOLTIP_DURATION_MILLISECONDS } from 'app/config/constants/constants';
import { observer } from 'mobx-react';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { runInAction } from 'mobx';
import { TextFormat } from 'react-jhipster';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { CommentStore } from 'app/stores/comment.store';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
import { faComment as fasComment } from '@fortawesome/free-solid-svg-icons';
import { GREY } from 'app/config/colors';
import { onValue, ref } from 'firebase/database';
import { getUserFullName } from 'app/shared/util/utils';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

function isCommentResolved(comment: Comment) {
  return typeof comment.resolved === 'boolean' ? comment.resolved : comment.resolved === 'true';
}

export interface ICommentIconProps extends StoreProps {
  id: string;
  size?: SizeProp;
  path: string;
}

const CommentIcon = observer((props: ICommentIconProps) => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!props.firebaseDb) {
      return;
    }
    const unsubscribe = onValue(ref(props.firebaseDb, props.path), snapshot => {
      setComments(snapshot.val() || []);
    });

    return () => unsubscribe?.();
  }, []);

  let color: string;
  if (comments.length === 0) {
    color = 'black';
  } else if (comments.some(comment => !isCommentResolved(comment))) {
    color = 'gold';
  } else {
    color = 'green';
  }

  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  function handleMouseEnter() {
    if (props.commentStore?.openCommentsId !== props.id) {
      runInAction(() => props.commentStore?.setOpenCommentsId(props.id));
    }
    clearTimeout(timeoutId.current ?? undefined);
  }

  function handleMouseLeave() {
    const id = setTimeout(() => {
      if (props.id === props.commentStore?.openCommentsId) {
        runInAction(() => props.commentStore?.setOpenCommentsId(null));
      }
    }, CLOSE_TOOLTIP_DURATION_MILLISECONDS);

    timeoutId.current = id;
  }

  async function handleCreateComment(content: string) {
    const newComment = new Comment();
    newComment.content = content;
    newComment.email = props.account?.email ?? '';
    newComment.resolved = 'false';
    newComment.userName = getUserFullName(props.account);

    try {
      await props.handleFirebasePushToArray?.(props.path, [newComment]);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleDeleteComments(indices: number[]) {
    try {
      await props.deleteComments?.(props.path, indices);
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleResolveComment(index: number) {
    try {
      await props.handleFirebaseUpdate?.(`${props.path}/${index}`, { resolved: true });
    } catch (error) {
      notifyError(error);
    }
  }

  async function handleUnresolveComment(index: number) {
    try {
      await props.handleFirebaseUpdate?.(`${props.path}/${index}`, { resolved: false });
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <DefaultTooltip
        overlayInnerStyle={{ minWidth: '400px', padding: 0 }}
        placement="left"
        destroyTooltipOnHide
        visible={props.id === props.commentStore?.openCommentsId}
        overlay={
          <CommentBox
            commentStore={props.commentStore!}
            openCommentsId={props.id}
            comments={comments}
            onCreateComment={handleCreateComment}
            onResolveComment={handleResolveComment}
            onUnresolveComment={handleUnresolveComment}
            onDeleteComments={handleDeleteComments}
          />
        }
      >
        <div>
          <FontAwesomeIcon
            size={props.size}
            id={props.id}
            icon={comments.length > 0 ? fasComment : farComment}
            color={comments.length > 0 ? color : GREY}
          />
        </div>
      </DefaultTooltip>
    </div>
  );
});

export interface ICommentBoxProps {
  commentStore: CommentStore;
  comments: Comment[];
  openCommentsId: string;
  onCreateComment: (content: string) => void;
  onResolveComment: (index: number) => void;
  onUnresolveComment: (index: number) => void;
  onDeleteComments: (indices: number[]) => void;
}

const CommentBox = observer((props: ICommentBoxProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollPosition = props.commentStore.openCommentsScrollPosition;
    if (scrollPosition && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  });

  useEffect(() => {
    return () => {
      if (props.comments && props.commentStore.openCommentsId !== props.openCommentsId) {
        props.onDeleteComments(props.commentStore.commentIndiciesToDelete);
        runInAction(() => props.commentStore.clearCommentsToDelete());
      }
    };
  }, []);

  const sortedCommentItems = props.comments
    ?.map((comment, index) => {
      return [
        comment.date,
        <CommentItem
          commentStore={props.commentStore}
          key={`${comment.date}-${comment.email}`}
          comment={comment}
          index={index}
          onResolveComment={() => {
            runInAction(() => props.commentStore.setOpenCommentsScrollPosition(scrollContainerRef.current?.scrollTop ?? 0));
            props.onResolveComment(index);
          }}
          onUnresolveComment={() => {
            runInAction(() => props.commentStore.setOpenCommentsScrollPosition(scrollContainerRef.current?.scrollTop ?? 0));
            props.onUnresolveComment(index);
          }}
        />,
      ];
    })
    .sort((comment1, comment2) => {
      return parseInt(comment2[0] as string, 10) - parseInt(comment1[0] as string, 10);
    })
    .map(comment => comment[1]);

  return (
    <>
      {sortedCommentItems && sortedCommentItems.length > 0 && (
        <div ref={scrollContainerRef} style={{ maxHeight: '320px', overflow: 'auto' }}>
          <ListGroup flush>{sortedCommentItems}</ListGroup>
        </div>
      )}
      <CommentInput
        commentStore={props.commentStore}
        onCreateComment={content => {
          runInAction(() => props.commentStore.setOpenCommentsScrollPosition(0));
          props.onCreateComment(content);
        }}
      />
    </>
  );
});

export interface ICommentInputProps {
  commentStore: CommentStore;
  onCreateComment: (content: string) => void;
}

const CommentInput = observer((props: ICommentInputProps) => {
  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (props.commentStore.commentInputValue !== '' && event.key === 'Enter') {
      props.onCreateComment(props.commentStore.commentInputValue);
      props.commentStore.setCommentInputValue('');
    }
  }

  useEffect(() => {
    return () => {
      props.commentStore.setCommentInputValue('');
    };
  }, []);

  return (
    <InputGroup className="p-2">
      <Input
        className="rounded-0"
        placeholder="Add comment"
        onChange={event => props.commentStore.setCommentInputValue(event.target.value)}
        value={props.commentStore.commentInputValue}
        onKeyPress={handleKeyPress}
      />
      <Button
        className="rounded-0"
        outline
        disabled={props.commentStore.commentInputValue === ''}
        onClick={() => {
          props.onCreateComment(props.commentStore.commentInputValue);
          props.commentStore.setCommentInputValue('');
        }}
      >
        <FontAwesomeIcon icon={'plus'} />
      </Button>
    </InputGroup>
  );
});

interface ICommentItemProps {
  commentStore: CommentStore;
  comment: Comment;
  index: number;
  onResolveComment: () => void;
  onUnresolveComment: () => void;
}

const CommentItem = observer((props: ICommentItemProps) => {
  const isResolved = isCommentResolved(props.comment);

  const isPendingDeletion = props.commentStore.commentIndiciesToDelete.includes(props.index);

  function handleDelete() {
    if (isPendingDeletion) {
      runInAction(() => props.commentStore.removeIndexToDelete(props.index));
    } else {
      runInAction(() => props.commentStore.addCommentToDeleteIndex(props.index));
    }
  }

  return (
    <ListGroupItem>
      <div className="mb-2 d-flex justify-content-between">
        <div>
          <div>{props.comment.userName}</div>
          <TextFormat value={new Date(parseInt(props.comment.date, 10))} type="date" format={APP_DATETIME_FORMAT} />
        </div>
        <div>
          <Button
            className="me-2"
            size="sm"
            outline
            color={isResolved ? 'secondary' : 'primary'}
            onClick={() => (isResolved ? props.onUnresolveComment() : props.onResolveComment())}
          >
            {isResolved ? 'Unresolve' : 'Resolve'}
          </Button>
          <Button size="sm" outline color={isPendingDeletion ? 'secondary' : 'danger'} onClick={handleDelete}>
            {isPendingDeletion ? 'Revert' : 'Delete'}
          </Button>
        </div>
      </div>
      <div>
        <b>{props.comment.content}</b>
      </div>
    </ListGroupItem>
  );
});

const mapStoreToProps = ({ commentStore, firebaseAppStore, authStore, firebaseGeneService }: IRootStore) => ({
  commentStore,
  firebaseDb: firebaseAppStore.firebaseDb,
  account: authStore.account,
  handleFirebaseUpdate: firebaseGeneService.updateObject,
  handleFirebasePushToArray: firebaseGeneService.pushObjectsToArray,
  deleteComments: firebaseGeneService.deleteObjectsFromArray,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CommentIcon);
