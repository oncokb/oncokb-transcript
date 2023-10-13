import classNames from 'classnames';
import React from 'react';
import { Col, Row } from 'reactstrap';

const PageContainer: React.FunctionComponent<{
  className?: string;
}> = props => {
  return (
    <Row className={classNames(props.className, 'justify-content-center')}>
      <Col xl={10} lg={11}>
        {props.children}
      </Col>
    </Row>
  );
};
export default PageContainer;
