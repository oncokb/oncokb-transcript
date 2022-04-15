import React from 'react';
import { Col, Row } from 'reactstrap';

interface IFormSectionProps {
  sectionTitle?: string;
  isFirst?: boolean;
}

export const FormSection: React.FunctionComponent<IFormSectionProps> = ({ sectionTitle, isFirst = false, children }) => {
  return (
    <Row className={`justify-content-center ${isFirst ? 'pb-3' : 'border-top py-3'}`}>
      <Col md="3">
        <h5>{sectionTitle}</h5>
      </Col>
      <Col md="9">{children}</Col>
    </Row>
  );
};

export default FormSection;
