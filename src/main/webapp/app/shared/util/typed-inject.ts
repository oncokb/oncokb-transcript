import { inject, useObserver } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { MobXProviderContext } from 'mobx-react';
import React from 'react';

export type InjectProps<T extends S, S extends object> = Omit<T, keyof S>;
export type InjectedComponent<T extends S, S extends object> = React.FC<InjectProps<T, S>>;
export type GrabStoresFn<S extends object> = Parameters<typeof connect<S>>[0];

export function connect<MapStoreToPropsRtn extends object>(grabStoresFn: (param: IRootStore, newProps: unknown) => MapStoreToPropsRtn) {
  return <Props extends MapStoreToPropsRtn>(
    baseComponent: React.FunctionComponent<Props>,
  ): InjectedComponent<Props, MapStoreToPropsRtn> => {
    const component = (ownProps: Omit<unknown, keyof MapStoreToPropsRtn>) => {
      const store = React.useContext(MobXProviderContext) as IRootStore;
      const newProps = { ...ownProps } as Props;
      return useObserver(() => {
        Object.assign(newProps, grabStoresFn(store || {}, newProps) || {});
        return baseComponent(newProps);
      });
    };
    component.displayName = baseComponent.name;
    return component;
  };
}

export const componentInject = inject;
