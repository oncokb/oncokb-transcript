import GeneSelect from 'app/shared/select/GeneSelect';
import React from 'react';
import { Col, Container, Row } from 'reactstrap';

export default function CurateGeneTab() {
  return (
    <Container>
      <Row>
        <Col>
          <GeneSelect />
        </Col>
      </Row>
    </Container>
  );
}
