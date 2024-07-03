import { inject, useObserver } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { MobXProviderContext } from 'mobx-react';
import React from 'react';

export const connect = (grabStoresFn: (param: IRootStore | Record<string, never>, any) => any) => {
  return baseComponent => {
    const component = ownProps => {
      const store = React.useContext(MobXProviderContext) as IRootStore;
      const newProps = { ...ownProps };
      return useObserver(() => {
        Object.assign(newProps, grabStoresFn(store || {}, newProps) || {});
        return baseComponent(newProps);
      });
    };
    component.displayName = baseComponent.name;
    return component;
  };
};

export const componentInject = inject;
