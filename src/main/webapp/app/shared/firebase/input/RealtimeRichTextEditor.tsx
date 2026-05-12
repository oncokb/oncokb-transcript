import RichTextEditor from 'app/shared/rich-text-editor/RichTextEditor';
import { genericLinkExtension, LinkToolbarAddon } from 'app/shared/rich-text-editor/addons/LinkToolbarAddon';
import { PmidGroup } from 'app/shared/rich-text-editor/addons/PmidGroupExtension';
import { AbstractReference, NctReference } from 'app/shared/rich-text-editor/addons/ReferenceNodeExtensions';
import { parseRichTextDoc } from 'app/shared/rich-text-editor/richTextSchema';
import { referencePasteHandler } from 'app/shared/rich-text-editor/addons/referenceParsing';
import { AbstractToolbarAddon, NctToolbarAddon, PmidToolbarAddon } from 'app/shared/rich-text-editor/addons/ReferenceToolbarAddon';
import { ReferenceTooltipAddon } from 'app/shared/rich-text-editor/addons/ReferenceTooltipAddon';
import { RichTextEditorChange, RichTextPasteHandler } from 'app/shared/rich-text-editor/RichTextEditor';
import { Review } from 'app/shared/model/firebase/firebase.model';
import { IRootStore } from 'app/stores/createStore';
import classNames from 'classnames';
import { onValue, ref, Unsubscribe } from 'firebase/database';
import { inject } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { FormFeedback } from 'reactstrap';
import { RealtimeBasicLabel } from './RealtimeBasicInput';

export interface IRealtimeRichTextEditor extends StoreProps {
  firebasePath: string;
  label: string;
  labelIcon?: JSX.Element;
  labelClass?: string;
  className?: string;
  inputClass?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  disabledMessage?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidMessage?: string;
  updateMetaData?: boolean;
  id?: string;
}

const extensions = [genericLinkExtension, PmidGroup, AbstractReference, NctReference];
const pasteHandlers: RichTextPasteHandler[] = [referencePasteHandler];

const RealtimeRichTextEditor: React.FC<IRealtimeRichTextEditor> = ({
  db,
  firebasePath,
  firebaseRepository,
  updateReviewableContent,
  label,
  labelIcon,
  labelClass,
  className,
  inputClass,
  style,
  disabled = false,
  disabledMessage,
  placeholder,
  invalid,
  invalidMessage,
  updateMetaData = true,
  id,
}) => {
  const fieldId = id ?? firebasePath;

  const [value, setValue] = useState<string>();
  const [jsonValue, setJsonValue] = useState<unknown>();
  const [valueLoaded, setValueLoaded] = useState(false);
  const [jsonValueLoaded, setJsonValueLoaded] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (!db) return;

    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(db, firebasePath), snapshot => {
        setValue(snapshot.val());
        setValueLoaded(true);
      }),
    );
    callbacks.push(
      onValue(ref(db, `${firebasePath}_json`), snapshot => {
        setJsonValue(snapshot.val() ?? undefined);
        setJsonValueLoaded(true);
      }),
    );
    callbacks.push(
      onValue(ref(db, `${firebasePath}_review`), snapshot => {
        setReview(snapshot.val());
      }),
    );
    callbacks.push(
      onValue(ref(db, `${firebasePath}_uuid`), snapshot => {
        setUuid(snapshot.val());
      }),
    );

    return () => {
      callbacks.forEach(cb => cb?.());
    };
  }, [db, firebasePath]);

  useEffect(() => {
    if (!valueLoaded) {
      return;
    }
    setCurrentText(value ?? '');
  }, [value, valueLoaded]);

  const handleUpdate = async ({ text, json }: RichTextEditorChange) => {
    if (!firebaseRepository) return;

    const reviewUpdateObj = await updateReviewableContent?.(firebasePath, value, text, review, uuid, updateMetaData, false);

    const updateObj: Record<string, unknown> = {
      [firebasePath]: text,
      ...(reviewUpdateObj ?? {}),
      [`${firebasePath}_json`]: JSON.parse(JSON.stringify(json)),
    };

    await firebaseRepository.update('/', updateObj);
  };

  const handleEditorChange = (change: RichTextEditorChange) => {
    setCurrentText(change.text);
    handleUpdate(change);
  };

  const firebaseContentLoaded = valueLoaded && jsonValueLoaded;
  const content = firebaseContentLoaded ? parseRichTextDoc(jsonValue) : undefined;
  const plainText = firebaseContentLoaded && !content ? value : undefined;

  return (
    <div className={classNames('mb-2', className)} style={style}>
      {label && <RealtimeBasicLabel label={label} labelIcon={labelIcon} id={fieldId} labelClass={classNames('fw-bold', labelClass)} />}
      {firebaseContentLoaded && (
        <RichTextEditor
          id={fieldId}
          content={content}
          plainText={plainText}
          extensions={extensions}
          pasteHandlers={pasteHandlers}
          toolbarAddons={
            <>
              <PmidToolbarAddon />
              <NctToolbarAddon />
              <AbstractToolbarAddon />
              <LinkToolbarAddon />
            </>
          }
          overlayAddons={<ReferenceTooltipAddon />}
          inputClassName={inputClass}
          disabled={disabled}
          placeholder={placeholder}
          invalid={invalid}
          onChange={handleEditorChange}
        />
      )}
      {disabled && disabledMessage && currentText && <div className="text-danger">{disabledMessage}</div>}
      {invalid && <FormFeedback className="d-block">{invalidMessage ?? ''}</FormFeedback>}
    </div>
  );
};

const mapStoreToProps = ({ firebaseAppStore, firebaseGeneReviewService, firebaseRepository }: IRootStore) => ({
  db: firebaseAppStore.firebaseDb,
  firebaseRepository,
  updateReviewableContent: firebaseGeneReviewService.updateReviewableContent,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default inject(mapStoreToProps)(RealtimeRichTextEditor);
