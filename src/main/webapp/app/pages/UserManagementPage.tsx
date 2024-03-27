import axios from 'axios';
import { observer } from 'mobx-react';
import React from 'react';
import { Button } from 'reactstrap';

class UserManagementPage extends React.Component {
  render() {
    return (
      <div>
        user management page<Button onClick={() => axios.get('/api/admin/users')}>Click here</Button>
      </div>
    );
  }
}

export default observer(UserManagementPage);
