import { useState } from 'react';
import styles from './styles.module.scss';
import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

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
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(open);

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
            node.style.setProperty('border-left-color', borderLeftColor, 'important');
          }
        }}
      >
        <div style={{ flexGrow: 1 }} className="d-flex align-items-center">
          <button
            disabled={disableCollapsible}
            style={{ opacity: disableCollapsible ? '0' : '1' }}
            type="button"
            className={classNames('btn', 'py-1')}
            onClick={() => setIsOpen(_isOpen => !_isOpen)}
          >
            {isOpen ? <FontAwesomeIcon icon={faChevronDown} size={'sm'} /> : <FontAwesomeIcon icon={faChevronRight} size={'sm'} />}
          </button>
          <span className={classNames(disableLeftBorder ? undefined : 'font-weight-bold')}>{title}</span>
          {isSectionEmpty && (
            <span className={`badge badge-pill badge-info ml-2 mr-2`} style={{ fontSize: '60%' }}>
              No entry
            </span>
          )}
          <div className="mr-auto" />
          <div className="d-flex align-items-center">
            {info}
            {action && <div className={classNames(styles.divider)} />}
            {action}
          </div>
        </div>
      </div>
      {isOpen && <div className={classNames('card-body', styles.body)}>{children}</div>}
    </div>
  );
}
