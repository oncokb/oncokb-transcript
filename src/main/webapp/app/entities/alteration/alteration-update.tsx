import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import _ from 'lodash';
import AlterationUpdateForm from './alteration-update-form';

export interface IAlterationUpdateProps extends RouteComponentProps<{ id: string }> {}

export const AlterationUpdate = (props: IAlterationUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  return <AlterationUpdateForm isNew={isNew} id={props.match.params.id} />;
};

export default AlterationUpdate;
