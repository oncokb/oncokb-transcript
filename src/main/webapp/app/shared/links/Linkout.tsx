import React, { CSSProperties } from 'react';

export const Linkout: React.FunctionComponent<{
  to: string;
  className?: string;
  style?: CSSProperties;
  addHttpsProtocol?: boolean;
}> = props => {
  let updatedLink = props.to;
  if (props.addHttpsProtocol === undefined || props.addHttpsProtocol) {
    if (!/http(s)?:\/\/.*/.test(updatedLink)) {
      updatedLink = `https://${updatedLink}`;
    }
  }
  return (
    <a href={updatedLink} target="_blank" rel="noopener noreferrer" style={props.style} className={props.className}>
      {props.children ? props.children : props.to}
    </a>
  );
};
