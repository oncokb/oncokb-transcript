import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import { useEffect } from 'react';
import { matchPath, useHistory } from 'react-router-dom';
import React from 'react';
import { connect } from './shared/util/typed-inject';
import { IRootStore } from './stores';

// Paths that should show the curation panel
const includedPaths = ['/companion-diagnostic-device/:id/edit'];

interface ILayoutProps extends StoreProps {
  children: React.ReactNode;
}

const Layout: React.FunctionComponent<ILayoutProps> = props => {
  const history = useHistory();

  useEffect(() => {
    history.listen((location: { pathname: string }) => {
      const matchedPath = includedPaths.filter(path => matchPath(location.pathname, { path, exact: true }))[0];
      props.toggleOncoKBSidebar(!!matchedPath);
    });
  }, []);

  return <>{props.children}</>;
};

const mapStoreToProps = ({ layoutStore }: IRootStore) => ({
  toggleOncoKBSidebar: layoutStore.toggleOncoKBSidebar,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Layout);
