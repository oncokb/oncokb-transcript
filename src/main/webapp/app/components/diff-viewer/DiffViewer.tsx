import React, { useEffect, useMemo, useState } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import Tabs from 'app/components/tabs/tabs';
import { Input } from 'reactstrap';
import classnames from 'classnames';
import * as styles from './style.module.scss';
import { RealtimeTextAreaInput } from 'app/shared/firebase/input/RealtimeInputs';
import { Database, onValue, ref } from 'firebase/database';
import { Unsubscribe } from 'firebase/database';

export type FirebaseContent = {
  path: string;
  db: Database;
};
type DiffViewerProps = {
  new: string | FirebaseContent | undefined;
  old: string | undefined;
  type: 'tabs' | 'stack' | 'merged';
  className?: string;
};

const getMergedDiff = (newContent='', oldContent='') => {
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(oldContent, newContent);
  dmp.diff_cleanupSemantic(diff);
  return dmp.diff_prettyHtml(diff);
};

const TabsDiff = (props: DiffViewerProps) => {
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    const callbacks: Unsubscribe[] = [];

    if (typeof props.new !== 'string' && props.new !== undefined) {
      callbacks.push(
        onValue(ref(props.new.db, props.new.path), snapshot => {
          setInputValue(snapshot.val());
        }),
      );
    } else {
      setInputValue(props.new ?? '');
    }
    return () => {
      callbacks.forEach(callback => callback?.());
    };
  }, [props.new]);

  const diffHtml = useMemo(() => {
    return getMergedDiff(inputValue, props.old);
  }, [inputValue]);

  return (
    <Tabs
      className={'mx-0'}
      tabs={[
        {
          title: 'New',
          content: (
            <div>
              {typeof props.new === 'string' && <Input type={'textarea'} value={props.new} disabled className={styles.disabledText} />}
              {typeof props.new === 'object' && (
                <RealtimeTextAreaInput firebasePath={props.new.path} label="" name="description" parseRefs updateMetaData={false} />
              )}
              <div className={classnames('mb-2', styles.diff)}>
                <div className={'fw-bold'}>Difference comparing to the old</div>
                <div dangerouslySetInnerHTML={{ __html: diffHtml }}></div>
              </div>
            </div>
          ),
        },
        {
          title: 'Old',
          content: <Input type={'textarea'} value={props.old} disabled className={styles.disabledText} />,
        },
      ]}
    />
  );
};

const MergedDiff = (props: DiffViewerProps) => {
  return <div dangerouslySetInnerHTML={{ __html: getMergedDiff(props.new as string, props.old) }}></div>;
};

const StackDiff = (props: DiffViewerProps) => {
  return (
    <div>
      {props.new && (
        <div className={classnames(styles.section)}>
          <div className={styles.sectionHeader}>+</div>
          <div className={classnames(styles.sectionContent, styles.newContent)}>{props.new}</div>
        </div>
      )}
      {props.old && (
        <div className={classnames(styles.section)}>
          <div className={styles.sectionHeader}>-</div>
          <div className={classnames(styles.sectionContent, styles.oldContent)}>{props.old}</div>
        </div>
      )}
    </div>
  );
};
const DiffViewer: React.FunctionComponent<DiffViewerProps> = props => {
  return (
    <div className={props.className}>
      {props.type === 'tabs' && <TabsDiff {...props} />}
      {props.type === 'stack' && <StackDiff {...props} />}
      {props.type === 'merged' && <MergedDiff {...props} />}
    </div>
  );
};

export default DiffViewer;
