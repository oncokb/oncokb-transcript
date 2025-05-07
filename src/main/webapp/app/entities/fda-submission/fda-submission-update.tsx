import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FdaSubmissionForm from './fda-submission-update-form';

export interface IFdaSubmissionUpdateProps extends RouteComponentProps<{ id: string }> {}

export const FdaSubmissionUpdate = (props: IFdaSubmissionUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  return <FdaSubmissionForm isNew={isNew} />;
};
