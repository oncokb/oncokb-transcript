import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import React from 'react';

export default function CPLHelpTooltip(props) {
  const tableData = [
    ['[[tumor type]]', 'Tumor type', 'Melanoma'],
    ['[[gene]]', 'Gene', 'BRAF'],
    ['[[mutation]] [[[mutation]]]', 'Mutation + ‘mutation’', 'V600E mutation'],
    ['[[mutation]] [[[mutant]]]', 'Mutation + ‘mutant’', 'V600E mutant'],
    ['[[variant]]', 'Gene + Mutation + ‘mutant’ + Tumor Type', 'BRAF V600E mutant melanoma'],
    ['[[mutation|singular]]', 'Singularize mutation', 'Oncogenic Mutation'],
    ['[[mutation|plural]]', 'Pluralize mutation', 'Fusions'],
  ];
  return (
    <DefaultTooltip
      placement="top"
      overlayInnerStyle={{ maxWidth: '450px' }}
      overlay={
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black' }}>
              <th>OCPL Code</th>
              <th>Output of Code from API</th>
              <th>Example of output in an annotation</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                <td>
                  <pre style={{ margin: 0 }}>{row[0]}</pre>
                </td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      {props.children}
    </DefaultTooltip>
  );
}
