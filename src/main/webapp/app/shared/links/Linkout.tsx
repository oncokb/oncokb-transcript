import classNames from 'classnames';
import React, { CSSProperties } from 'react';

export interface ILinkoutProps {
  to: string;
  className?: string;
  style?: CSSProperties;
  addHttpsProtocol?: boolean;
  children?: React.ReactNode;
}

export const Linkout: React.FunctionComponent<ILinkoutProps> = ({
  to,
  className,
  style,
  addHttpsProtocol = true,
  children,
}: ILinkoutProps) => {
  let updatedLink = to;
  if (addHttpsProtocol) {
    if (!/http(s)?:\/\/.*/.test(updatedLink)) {
      updatedLink = `https://${updatedLink}`;
    }
  }
  return (
    <a href={updatedLink} target="_blank" rel="noopener noreferrer" style={style} className={classNames(className)}>
      {children ? children : to}
    </a>
  );
};
