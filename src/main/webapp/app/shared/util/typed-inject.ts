import { inject, useObserver } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { MobXProviderContext } from 'mobx-react';
import React from 'react';
import { Props as SelectProps } from 'react-select';
import { IValueMap } from 'mobx-react/dist/types/IValueMap';
import { IStoresToProps } from 'mobx-react/dist/types/IStoresToProps';

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

export type InjectProps<T extends S, S extends object> = Omit<T, keyof S>;
export type InjectedComponent<T extends S, S extends object> = React.FC<InjectProps<T, S>>;
export type GrabStoresFn<S extends object> = Parameters<typeof connect<S>>[0];

export function connect<S extends object>(
  grabStoresFn: (param: IRootStore, newProps: unknown) => S,
): <T extends S>(baseComponent: React.FunctionComponent<T>) => InjectedComponent<T, S> {
  return <T extends S>(baseComponent: React.FunctionComponent<T>): InjectedComponent<T, S> => {
    const component = (ownProps: Omit<unknown, keyof S>) => {
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
