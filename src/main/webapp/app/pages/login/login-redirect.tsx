import React, { useEffect } from 'react';

export const LoginRedirect = props => {
  useEffect(() => {
    window.location.reload();
  });

  return null;
};

export default LoginRedirect;
