import { useState } from 'react';
import styles from './styles.module.scss';
import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import NoEntryBadge from 'app/shared/badge/NoEntryBadge';
import { DANGER } from 'app/config/colors';
import DefaultBadge from 'app/shared/badge/DefaultBadge';

const deletedSectionTooltipOverlay = (
  <div>
    <div>This deletion is pending for review.</div>
    <div>To confirm or revert the deletion, please enter review mode.</div>
  </div>
);

export interface CollapsibleProps {
  title: React.ReactNode;
  disableLeftBorder?: boolean;
  borderLeftColor?: string;
  info?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  isSectionEmpty?: boolean;
  disableCollapsible?: boolean;
  isPendingDelete?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export default function Collapsible({
  title,
  disableLeftBorder = false,
  borderLeftColor,
  info,
  action,
  children,
  className,
  open = false,
  isSectionEmpty = false,
  disableCollapsible = false,
  isPendingDelete = false,
  onToggle,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(open);

  if (isPendingDelete) {
    disableCollapsible = true;
  }

  const getBadge = () => {
    if (isPendingDelete) {
      return <DefaultBadge color="danger" text="Deleted" tooltipOverlay={deletedSectionTooltipOverlay} />;
    }
    if (isSectionEmpty) {
      return <NoEntryBadge />;
    }
  };

  const handleToggleCollapsible = () => {
    setIsOpen(_isOpen => !_isOpen);
    onToggle && onToggle(!isOpen);
  };

  return (
    <div className={classNames('card', className, styles.main)}>
      <div
        className={classNames(
          'card-header d-flex align-items-center p-1 bg-transparent pr-2',
          styles.header,
          disableLeftBorder ? styles.hiddenHeaderLeftBorder : undefined
        )}
        ref={node => {
          if (node && borderLeftColor) {
            if (isPendingDelete) {
              borderLeftColor = DANGER;
            }
            node.style.setProperty('border-left-color', borderLeftColor, 'important');
          }
        }}
      >
        <div style={{ flexGrow: 1 }} className="d-flex align-items-center">
          <div className={styles.collapsibleTitleWrapper} onClick={handleToggleCollapsible}>
            <button
              disabled={disableCollapsible}
              style={{ opacity: disableCollapsible ? '0' : '1' }}
              type="button"
              className={classNames('btn', 'py-1')}
              onClick={handleToggleCollapsible}
            >
              {isOpen ? <FontAwesomeIcon icon={faChevronDown} size={'sm'} /> : <FontAwesomeIcon icon={faChevronRight} size={'sm'} />}
            </button>
            <span
              className={classNames(
                disableLeftBorder ? undefined : 'font-weight-bold',
                isPendingDelete ? 'text-decoration-line-through' : undefined
              )}
            >
              {title}
            </span>
          </div>
          {getBadge()}
          <div className="mr-auto" />
          {!isPendingDelete ? (
            <div className="d-flex align-items-center">
              {info}
              {action && (
                <>
                  <div className={classNames(styles.divider)} />
                  <div className={'collapsible-action all-children-margin'}>{action}</div>
                </>
              )}
            </div>
          ) : undefined}
        </div>
      </div>
      {isOpen && <div className={classNames('card-body', styles.body)}>{children}</div>}
    </div>
  );
}
