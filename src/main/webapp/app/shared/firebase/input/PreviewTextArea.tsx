import { SentryError } from 'app/config/sentry-error';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { utilsClient } from 'app/shared/api/clients';
import { parseFirebaseGenePath } from 'app/shared/util/firebase/firebase-path-utils';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { inject } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'reactstrap';

export interface IPreviewTextAreaProps extends React.HTMLAttributes<HTMLDivElement>, StoreProps {
  firebasePath: string; // firebase path that component needs to listen to
  className?: string;
  mutationName?: string;
  cancerTypeName?: string;
}

const PreviewTextArea: React.FunctionComponent<IPreviewTextAreaProps> = (props: IPreviewTextAreaProps) => {
  const { db, firebasePath, className, ...otherProps } = props;

  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [inputValueLoaded, setInputValueLoaded] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!db) {
      return;
    }
    const unsubscribe = onValue(ref(db, firebasePath), snapshot => {
      setInputValue(snapshot.val());
      setInputValueLoaded(true);
    });

    return () => {
      unsubscribe();
    };
  }, [firebasePath, db]);

  useEffect(() => {
    if (inputValueLoaded && inputValue) {
      fetchAnnotatedText(inputValue);
    }
  }, [inputValue, inputValueLoaded]);

  const fetchAnnotatedText = async (text: string) => {
    setIsLoading(true);
    try {
      const parseRes = parseFirebaseGenePath(firebasePath);
      if (!parseRes?.hugoSymbol) {
        throw new Error();
      }
      const response = await utilsClient.utilAnnotateCPLUsingPOST({
        template: text,
        hugoSymbol: parseRes.hugoSymbol,
        alteration: props.mutationName ?? '',
        cancerType: props.cancerTypeName ?? '',
      });
      setPreviewText(response.data);
    } catch (error) {
      setPreviewText(null);
      throw new SentryError('Cannot preview text', { firebasePath, previewText });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator isLoading size={LoaderSize.SMALL} />;
  }

  return (
    <div className={className} {...otherProps}>
      <Input innerRef={inputRef} type="textarea" value={previewText ?? 'Nothing to preview'} disabled style={{ minHeight: '100px' }} />
    </div>
  );
};

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  db: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default inject(mapStoreToProps)(PreviewTextArea);
