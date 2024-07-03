import React from 'react';
import { Col, Row } from 'reactstrap';

const SmallPageContainer: React.FunctionComponent<{
  size?: 'sm' | 'lg';
  className?: string;
  children: React.ReactNode;
}> = props => {
  return (
    <Row className={`justify-content-center ${props.className}`}>
      <Col lg={props.size ? (props.size === 'sm' ? '6' : '8') : '6'}>{props.children}</Col>
    </Row>
  );
};
export default SmallPageContainer;
