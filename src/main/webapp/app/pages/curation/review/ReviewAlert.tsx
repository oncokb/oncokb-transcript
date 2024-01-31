import React from 'react';
import { Alert } from 'reactstrap';

export interface IReviewAlertProps {
  isReviewer: boolean;
  isSuccess?: boolean;
}

export const ReviewAlert = (props: IReviewAlertProps) => {
  if (props.isReviewer) {
    if (props.isSuccess) {
      return (
        <Alert color="success">
          <div className="d-flex flex-column">
            <div className="d-flex justify-content-center">All items have been reviewed. Click the Review Complete button to exit.</div>
          </div>
        </Alert>
      );
    }
    return (
      <Alert color="warning">
        <div className="d-flex flex-column">
          <div className="d-flex justify-content-center">You are currently in Review mode. Click the Review Complete button to exit.</div>
          <div className="d-flex justify-content-center">Your actions CANNOT be reverted.</div>
        </div>
      </Alert>
    );
  } else {
    return (
      <Alert color="danger">
        <div className="d-flex flex-column">
          <div className="d-flex justify-content-center">Calvin Lu is currently reviewing the changes in this gene.</div>
          <div className="d-flex justify-content-center">You will not be able to make changes until review is completed.</div>
        </div>
      </Alert>
    );
  }
};
