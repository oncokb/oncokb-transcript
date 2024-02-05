import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import styles from './styles.module.scss';

export type Tab = {
  title: React.ReactNode;
  content: React.ReactNode;
};

export interface ITabsProps {
  tabs: Tab[];
  isCollapsed?: boolean;
  className?: string;
}

const Tabs = ({ tabs, isCollapsed = false, className }: ITabsProps) => {
  const [openTabIndex, setOpenTabIndex] = useState(0);

  useEffect(() => {
    if (openTabIndex >= tabs.length) {
      setOpenTabIndex(tabs.length - 1);
    }
  }, [tabs.length]);

  return (
    <Container className={className ? className : 'mr-3 ml-2 mt-1'} style={{ wordBreak: 'break-word' }}>
      <Row>
        <Col>
          <Row style={{ overflowX: 'auto', flexWrap: 'nowrap' }} className="border-bottom mb-3">
            {tabs.map((tab, index) => {
              return (
                <div
                  onClick={() => setOpenTabIndex(index)}
                  key={index}
                  className={`${styles.tab} ${index === openTabIndex ? styles.selected : ''}`}
                >
                  <h6>{tab.title}</h6>
                </div>
              );
            })}
          </Row>
          {!isCollapsed && (
            <Row>
              <Col>{tabs[openTabIndex]?.content}</Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Tabs;
