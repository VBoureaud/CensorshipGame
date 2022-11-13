import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function mDoughnut(props) {
  const data = {
    labels: ['Red', 'Blue'],
    datasets: [
      {
        label: '# of Votes',
        data: props.values ? props.values : [1,1],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (props.values.length !== 2 || (props.values[0] === "0" && props.values[1] === "0"))
    return <></>;

  return <div style={{ maxWidth: '400px', marginBottom: '15px' }}>
    <Doughnut data={data} />
  </div>;
}


export default mDoughnut;