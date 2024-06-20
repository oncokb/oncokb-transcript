import { inject, useObserver } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { MobXProviderContext } from 'mobx-react';
import React from 'react';
import { Props as SelectProps } from 'react-select';

/**
(storeState: IRootStore) => {
    getPubMedArticle: () => {
        pubMedArticle: PubMedDTO | null;
        error: RequiredError | null;
        loading: boolean;
        get: (pmid: any) => Promise<void>;
    };
}
  */

export type InjectProps<T extends object, S extends Partial<T>> = Omit<T, keyof S>;
export type InjectedComponent<T extends object, S extends Partial<T>> = React.FC<InjectProps<T, S>>;
export type GrabStoresFn<T extends object, S extends Partial<T>> = Parameters<typeof connect<T, S>>[0];

export function connect<T extends object, S extends Partial<T>>(grabStoresFn: (param: IRootStore, newProps: T) => S) {
  return (baseComponent: React.FunctionComponent<T>): InjectedComponent<T, S> => {
    const component = (ownProps: Omit<T, keyof S>) => {
      const store = React.useContext(MobXProviderContext) as IRootStore;
      const newProps = { ...ownProps } as T;
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
