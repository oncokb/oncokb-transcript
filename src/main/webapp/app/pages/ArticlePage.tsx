import { inject } from 'mobx-react';
import React from 'react';
import { RouteComponentProps } from 'react-router';

interface MatchParams {
  pmid: string;
}

class ArticlePage extends React.Component<RouteComponentProps<MatchParams>> {
  render() {
    return <div>Article Page for {this.props.match.params.pmid}</div>;
  }
}

export default inject('routerStore')(ArticlePage);
