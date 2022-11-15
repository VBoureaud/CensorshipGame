import React, { useEffect, useState } from 'react';
import { List, Skeleton, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import VoteSlider from "./VoteSlider";

function VoteList(props) {
  const [searchValue, setSearchValue] = useState('');
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(props.listVote.filter(elt => elt.address !== props.account.address));
    if (props.onChange)
      props.onChange(list)
  }, []);

  const onChange = (id, newValue) => {
    const currentList = list;
    if (currentList.filter(elt => elt.id === id).length)
      currentList.filter(elt => elt.id === id)[0].value = newValue;
    setList(currentList);

    if (props.onChange)
      props.onChange(list)
  };


  return <div style={{ marginBottom: '15px' }}>
    <Input
      size="large"
      placeholder="user or address"
      prefix={<SearchOutlined />}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
    />
    <List
      className="demo-loadmore-list"
      itemLayout="horizontal"
      dataSource={list.filter(elt => 
        elt.name.toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) !== -1 
        || elt.address.toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) !== -1)}
      renderItem={(item) => (
        <List.Item
          style={{ 
            background: "white",
            padding: "15px",
            textAlign: 'left',
          }}
          actions={<></>}
        >
          <Skeleton avatar title={false} loading={item.loading} active>
            <div style={{ display: 'flex', width: '100%' }}>
              <List.Item.Meta
                style={{ flex: 1 }}
                title={item.name}
                description={item.address}
              />
              <VoteSlider
                onChange={(newValue) => onChange(item.id, newValue)}
              />
            </div>
          </Skeleton>
        </List.Item>
      )}
    />
  </div>;
}


export default VoteList;