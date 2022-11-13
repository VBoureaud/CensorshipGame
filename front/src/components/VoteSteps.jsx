import { Button, Steps, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import VoteList from './VoteList';
import './VoteSteps.css';

const VoteSteps = (props) => {
	const [current, setCurrent] = useState(0);
	const [list, setList] = useState([]);
	const [changeTeam, setChangeTeam] = useState(false);

	const next = () => {
		setCurrent(current + 1);
	};
	const prev = () => {
		setCurrent(current - 1);
	};
	const steps = [{
		title: 'First',
		content: <>
			<span style={{ display: 'block', paddingBottom: '15px' }}>Choose who to save.</span>
			<VoteList
				account={props.account}
				listVote={props.listVote}
				onChange={setList}
			/>
		</>
	}, {
		title: 'Second',
		content: <div style={{ paddingTop: '40px' }}>
			<span style={{ marginRight: '15px' }}>Change team ?</span>
			<Switch
				style={{ border: '1px solid #555', paddingLeft: '3px' }}
				checked={changeTeam}
				onChange={(checked) => setChangeTeam(checked)}
				checkedChildren={<CheckOutlined />}
				unCheckedChildren={<CloseOutlined />}
		    />
			<span style={{ display: 'block' }}>Will be considered at the same time as the vote.</span>
		</div>
	}, {
		title: 'Last',
		content: <>
			<span style={{ display: 'block', padding: '15px 0' }}>Confirm:</span>
			<span style={{ display: 'block', fontWeight: 'bold' }}>Vote List</span>
			{list.filter(elt => elt.value > 0).length === 0 && <span>- Empty list -</span>}
			{list.filter(elt => elt.value > 0).map((elt, i) => <div key={i}>{elt.name} - {elt.value}</div>)}
			<span style={{ display: 'block', paddingTop: '15px' }}>Change Team: {changeTeam ? 'True' : 'False'}</span>
		</>,
	}];

	const items = steps.map((item) => ({
		key: item.title,
		title: item.title,
	}));


  return (
	<div>
	  	<Steps style={{ color: 'white' }} current={current} items={items} />
	  	<div style={{
		  minHeight: '380px',
		  maxHeight: '400px',
		  overflow: 'scroll',
		  marginTop: '16px',
		  paddingTop: '10px',
		  textAlign: 'center',
		  //backgroundColor: '#fafafa',
		  border: '1px dashed #e9e9e9',
		  borderRadius: '2px',
		  color: 'white',
		}}>
		{steps[current].content}
		</div>

	  	<div style={{ margin: '24px 0', height: '40px' }}>
			{current === steps.length - 1 && (
			  <Button type="primary" style={{ float: 'right' }} onClick={() => props.onConfirm && props.onConfirm(list, changeTeam)}>
				Done
			  </Button>
			)}
			{current > 0 && (
			  <Button
				style={{
				  margin: '0 8px',
				  float: 'left',
				}}
				onClick={() => prev()}
			  >
				Previous
			  </Button>
			)}
			{current < steps.length - 1 && (
			  <Button
				type="primary"
				onClick={() => next()}
				style={{
				  float: 'right',
				}}>
				Next
			  </Button>
			)}
	  	</div>
	</div>
  );
};
export default VoteSteps;