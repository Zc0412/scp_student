import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'umi';
import PublicTable from '@/components/Table';
import { Select, Button, Form, InputNumber, Popconfirm, Space } from 'antd';
import styles from '@/pages/student/finance/operation/index.less';

const originData = [];
for (let i = 0; i < 8; i++) {
  originData.push({
    _key: i.toString(),
    period: `${i}`,
    typeName: '假数据',
    amount: null,
    bankRegion: 'A',
    status: true,
  });
}

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  // 获取当前行编辑的焦点状态
  const inputRef = useRef(null);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const inputNode = <InputNumber ref={inputRef} min={0} />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `请输入${title}`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const OperationTable = (props) => {
  const { dispatch } = props;
  const { dataSource, loading } = props;
  const [form] = Form.useForm();
  // 获取课堂id
  const { classHourId } = JSON.parse(localStorage.getItem('STUDENT_IN_CLASS')) || {};
  // 当前编辑row key
  const [editingKey, setEditingKey] = useState('');
  // 是否可编辑
  const isEditing = (record) => record._key === editingKey;
  // 编辑
  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record._key);
  };
  // 取消编辑pop
  const handleCancelPop = () => {
    setEditingKey('');
  };

  const updateBankExpense = async (bankExpenseId) => {
    try {
      const amount = await form.validateFields();
      if (classHourId && bankExpenseId) {
        // 更新费用
        dispatch({
          type: 'studentOperation/updateBankExpense',
          payload: {
            classHourId,
            bankExpenseId,
            amount,
            period,
          },
          callback: () => setEditingKey(''),
        });
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  // 初始化查询期数
  const [period, setPeriod] = useState('1');

  useEffect(() => {
    if (classHourId) {
      // 查询薪资/费用
      dispatch({
        type: 'studentOperation/queryBankExpenses',
        payload: { classHourId, period },
      });
    }
  }, []);
  const columns = [
    {
      title: '期数',
      dataIndex: 'period',
      key: 'period',
      render: (period) => `第${period}期`,
    },
    {
      title: '类别',
      dataIndex: 'typeName',
      key: 'typeName',
    },
    {
      title: '总行/支行',
      dataIndex: 'bankTypeName',
      key: 'bankTypeName',
    },
    {
      title: '区域',
      dataIndex: 'bankRegion',
      key: 'bankRegion',
    },
    {
      title: '费用(万元)',
      dataIndex: 'amount',
      key: 'amount',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: '_key',
      key: '_key',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button type="primary" size="small" onClick={() => updateBankExpense(record._key)}>
              保存
            </Button>
            <Popconfirm title="确认取消?" onConfirm={handleCancelPop}>
              <Button type="link" size="small">
                取消
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Button
            type="link"
            size="small"
            disabled={editingKey !== ''}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        );
      },
    },
  ];
  // 表头
  const columnsData = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <>
      <div className={styles.choose}>
        <Select defaultValue="one" style={{ width: 120 }}>
          <Select.Option value="one">第一期</Select.Option>
          <Select.Option value="two">第二期</Select.Option>
        </Select>
      </div>
      {/*表单提交*/}
      <Form form={form} component={false}>
        <PublicTable
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowClassName="editable-row"
          // dataSource={dataSource}
          dataSource={originData}
          columns={columnsData}
          loading={loading}
          bordered
        />
      </Form>
    </>
  );
};

export default connect(({ studentOperation, loading }) => ({
  dataSource: studentOperation.queryBankExpensesData,
  loading: loading.effects['studentOperation/queryBankExpenses'],
}))(OperationTable);
