import React, { useEffect, useState } from 'react';
import { List, Skeleton, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import VoteSlider from "./VoteSlider";

function VoteList(props) {
  const [initLoading, setInitLoading] = useState(true);
  const [inputValue, setInputValue] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    //get list here
    setInitLoading(false);
    const res = {"results":[
      { "id": 0, "name":"Test","address":"0x2cdsdf656CA92e841e10889F3209a905aee77", "value": 0 },
      { "id": 1, "name":"Test2","address":"0x1c0EafcD1656CA92e841e10889F3209a905aee77", "value": 0 },
      { "id": 2, "name":"Test3","address":"0x8c0EafcD1656CA92e841e10889F3209a905aee77", "value": 0 },
      { "id": 3, "name":"Test4","address":"0x7c0EafcD1656CA92e841e10889F3209a905aee77", "value": 0 },
      { "id": 4, "name":"Test5","address":"0x0c0EafcD1656CA92e841e10889F3209a905aee77", "value": 0 },
    ]};
    setList(res.results);
    if (props.onChange)
      props.onChange(list)
  }, []);

  const onChange = (id, newValue) => {
    const currentList = list;
    currentList[id].value = newValue;
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
      loading={initLoading}
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