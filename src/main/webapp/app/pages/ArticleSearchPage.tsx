import React from 'react';
import Select from 'react-select';

class ArticleSearchPage extends React.Component {
  render() {
    return (
      <div>
        <h3>Search for articles</h3>
        <Select placeholder="Search Gene/Alteration" />
        <div>Search results here</div>
      </div>
    );
  }
}

export default ArticleSearchPage;
