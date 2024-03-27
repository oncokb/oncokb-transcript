import React from 'react';

interface IFormSectionProps {
  sectionTitle?: string;
  isFirst?: boolean;
}

export const FormSection: React.FunctionComponent<IFormSectionProps> = ({ sectionTitle, isFirst = false, children }) => {
  return (
    <div className={`${isFirst ? 'pb-3' : 'border-top py-3'}`}>
      <div>{children}</div>
    </div>
  );
};

export default FormSection;
