import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import { Col, Row } from 'reactstrap';

export interface IPageContainerProps extends StoreProps {
  className?: string;
}

const PageContainer: React.FunctionComponent<IPageContainerProps> = props => {
  return (
    <Row className={classNames(props.className, 'justify-content-center')}>
      <Col xl={props.showOncoKBSidebar ? 11 : 10} lg={props.showOncoKBSidebar ? 12 : 11}>
        {props.children}
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ layoutStore }: IRootStore) => ({
  showOncoKBSidebar: layoutStore.showOncoKBSidebar,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(PageContainer));
