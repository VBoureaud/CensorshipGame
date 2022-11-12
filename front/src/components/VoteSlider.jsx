import React, { useEffect, useState } from 'react';
import { Slider, InputNumber } from 'antd';

function VoteList(props) {
  const [inputValue, setInputValue] = useState(0);

  const onChange = (newValue) => {
    setInputValue(newValue);
    if (props.onChange) props.onChange(newValue);
  };

  return <div
    style={{ flex: 1, display: 'flex', width: '100%' }}
    >
	    <Slider
	    	style={{ width: '100%' }}
			min={0}
			max={20}
			onChange={onChange}
			value={typeof inputValue === 'number' ? inputValue : 0}
	    />
        <InputNumber
			min={0}
			max={20}
			style={{ margin: '0 16px' }}
			value={inputValue}
			onChange={onChange}
        />
  </div>;
}


export default VoteList;