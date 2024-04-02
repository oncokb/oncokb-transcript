import React, { useMemo } from 'react';
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

  const displayOptionsOverride = useMemo(() => {
    if (isPendingDelete) {
      defaultDisplayOptions.disableCollapsible = true;
      defaultDisplayOptions.hideAction = displayOptions?.hideAction || false;
      defaultDisplayOptions.hideInfo = displayOptions?.hideInfo || false;
    }
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
