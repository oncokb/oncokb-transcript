import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';

import { IRootStore } from 'app/stores';

export interface IAssociationProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Association = (props: IAssociationProps) => {
  return (
    <div>
      <h2 id="association-heading" data-cy="AssociationHeading">
        We do not provide a view to show a list of associations. If you have a specific association, please view using URL /association/:id
      </h2>
    </div>
  );
};

const mapStoreToProps = ({ associationStore }: IRootStore) => ({});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Association);
