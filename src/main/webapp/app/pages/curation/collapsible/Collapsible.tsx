import React, { useMemo, useRef } from 'react';
import BaseCollapsible, { BaseCollapsibleProps, CollapsibleColorProps, CollapsibleDisplayProps } from './BaseCollapsible';
import { DANGER } from 'app/config/colors';
import { DISABLED_COLLAPSIBLE_COLOR } from 'app/config/constants/constants';

export interface CollapsibleProps extends BaseCollapsibleProps {
  title: React.ReactNode;
  disableLeftBorder?: boolean;
  backgroundColor?: string;
  info?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  disableOpen?: boolean; // this prop is only used for the mutation collapsible, since it doesn't actually open when clicked
  isPendingDelete?: boolean;
}

export default function Collapsible({
  isPendingDelete = false,
  colorOptions,
  displayOptions,
  disableOpen,
  ...baseCollapsibleProps
}: CollapsibleProps) {
  const defaultColorOptions: CollapsibleColorProps = {
    hideLeftBorder: colorOptions?.hideLeftBorder ? colorOptions.hideLeftBorder : false,
    ...colorOptions,
  };

  const defaultDisplayOptions: CollapsibleDisplayProps = {
    disableCollapsible: displayOptions?.disableCollapsible || false,
    hideAction: displayOptions?.hideAction || false,
    hideInfo: displayOptions?.hideInfo || false,
  };

  const displayOptionRef = useRef<CollapsibleDisplayProps>();
  const isPendingDeleteRef = useRef<boolean>();
  const rerenderRef = useRef(0);
  rerenderRef.current++;
  const memoRerenderRef = useRef(0);

  const displayOptionsOverride = useMemo(() => {
    memoRerenderRef.current++;
    if (isPendingDelete) {
      defaultDisplayOptions.disableCollapsible = true;
      defaultDisplayOptions.hideAction = displayOptions?.hideAction || false;
      defaultDisplayOptions.hideInfo = displayOptions?.hideInfo || false;
    }
    const displayOptionsJson = JSON.stringify(displayOptions);
    const oldDisplayOptionsJson = JSON.stringify(displayOptionRef.current);
    if (isPendingDeleteRef.current === isPendingDelete && displayOptionsJson === oldDisplayOptionsJson) {
      // eslint-disable-next-line no-console
      console.log('********************************');
      // eslint-disable-next-line no-console
      console.log('rerender count component: ', rerenderRef.current, ' useMemo: ', memoRerenderRef.current);
      // eslint-disable-next-line no-console
      console.log('oldDisplayOptionsJson', oldDisplayOptionsJson);
      // eslint-disable-next-line no-console
      console.log('displayOptionsJson', displayOptionsJson);
      // eslint-disable-next-line no-console
      console.log('********************************');
    }
    displayOptionRef.current = displayOptions;
    isPendingDeleteRef.current = isPendingDelete;
    return defaultDisplayOptions;
  }, [isPendingDelete, displayOptions]);

  const colorOptionsOverride = useMemo(() => {
    const forceLeftColor = colorOptions.hideLeftBorder !== true && colorOptions.forceLeftColor;
    if (displayOptionsOverride.disableCollapsible && !forceLeftColor) {
      if (defaultColorOptions.hideLeftBorder === false) {
        defaultColorOptions.borderLeftColor = DISABLED_COLLAPSIBLE_COLOR;
      }
    }
    if (isPendingDelete) {
      if (defaultColorOptions.hideLeftBorder === false) {
        defaultColorOptions.borderLeftColor = DANGER;
      }
    }
    return defaultColorOptions;
  }, [isPendingDelete, displayOptionsOverride, colorOptions]);

  const disableOpenOverride = useMemo(() => {
    if (isPendingDelete) {
      return true;
    }
    if (displayOptionsOverride.disableCollapsible) {
      return true;
    }
    return disableOpen;
  }, [isPendingDelete, displayOptionsOverride]);

  return (
    <BaseCollapsible
      {...baseCollapsibleProps}
      colorOptions={colorOptionsOverride}
      displayOptions={displayOptionsOverride}
      disableOpen={disableOpenOverride}
    />
  );
}
