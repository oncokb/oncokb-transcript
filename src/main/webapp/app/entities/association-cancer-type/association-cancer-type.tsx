import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IRootStore } from 'app/stores';

export interface IAssociationCancerTypeProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const AssociationCancerType = (props: IAssociationCancerTypeProps) => {
  return (
    <div>
      <h2 id="association-cancer-type-heading" data-cy="AssociationCancerTypeHeading">
        We do not provide a view to show a list of association cancer types. If you have a specific association, please view using URL
        /association-cancer-type/:id
      </h2>
    </div>
  );
};

const mapStoreToProps = ({ associationCancerTypeStore }: IRootStore) => ({});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AssociationCancerType);
