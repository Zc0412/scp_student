import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'umi';
import { Button, Empty, Form, InputNumber, Popconfirm, Space } from 'antd';
import PublicTable from '@/components/Table';
import Tags from '@/components/Tags';
import Million from '@/components/Million';
import { yuan } from '@/utils/commonUtils';
import styles from '@/pages/student/risk/handle/index.less';
import Radios from '@/components/Radios';

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

const HandleTable = (props) => {
  const { dispatch, loading, saveLoading } = props;
  const {
    queryBankRwaOperationalData: { bankRwaOperationals: dataSource, period, periodCur, periodTtl },
  } = props;
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
      // totalRisk元转换为万元
      totalRisk: record.totalRisk / 10000,
    });
    setEditingKey(record._key);
  };
  // 取消编辑pop
  const handleCancelPop = () => {
    setEditingKey('');
  };

  const updateBankRwaOperational = async (bankRwaOperationalId) => {
    try {
      const values = await form.validateFields();
      if (values && classHourId && bankRwaOperationalId) {
        const params = yuan(values);
        // 保存操作风险
        dispatch({
          type: 'studentHandle/updateBankRwaOperational',
          payload: {
            classHourId,
            bankRwaOperationalId,
            ...params,
          },
          callback: () => setEditingKey(''),
        });
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  // 是否可以编辑
  const [editForm, setEditForm] = useState(true);
  /**
   * 查询列表
   * @param classHourId 课堂id
   * @param period 期数
   */
  const queryBankRwaOperationals = (classHourId, period) => {
    dispatch({
      type: 'studentHandle/queryBankRwaOperationals',
      payload: { classHourId, period },
    });
  };
  useEffect(() => {
    if (classHourId) {
      queryBankRwaOperationals(classHourId);
    }
  }, []);

  // 切换期数
  const onRadioChange = (e) => {
    const period = e.target.value;
    // 当期才能显示操作按钮
    setEditForm(period === periodCur);
    queryBankRwaOperationals(classHourId, period);
  };

  const columns = [
    {
      title: '所属期数',
      dataIndex: 'period',
      key: 'period',
      render: (period) => `第${period}期`,
    },
    {
      title: '期限',
      dataIndex: 'term',
      key: 'term',
    },
    {
      title: '业务类型',
      dataIndex: 'bizTypeName',
      key: 'bizTypeName',
      render: (bizTypeName) => <Tags>{bizTypeName}</Tags>,
    },
    {
      title: '利率属性',
      dataIndex: 'rateTypeName',
      key: 'rateTypeName',
      render: (rateTypeName) => <Tags>{rateTypeName}</Tags>,
    },
    {
      title: '客户类型',
      dataIndex: 'customerTypeName',
      key: 'customerTypeName',
    },
    {
      title: '金额(万元)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Million>{amount}</Million>,
    },
    {
      title: '风险小计',
      dataIndex: 'totalRisk',
      key: 'totalRisk',
      editable: true,
      render: (totalRisk) => <Million>{totalRisk}</Million>,
    },
    {
      title: '操作',
      dataIndex: '_key',
      key: '_key',
      fixed: 'right',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => updateBankRwaOperational(record._key)}
              loading={saveLoading}
            >
              保存
            </Button>
            <Popconfirm title="确认取消?" onConfirm={handleCancelPop}>
              <Button type="link" size="small">
                取消
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          editForm && (
            <Button
              type="primary"
              size="small"
              disabled={editingKey !== ''}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          )
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
  return periodTtl ? (
    <>
      <div className={styles.choose}>
        <Radios
          period={period}
          periodCur={periodCur}
          periodTtl={periodTtl}
          onRadioChange={onRadioChange}
        />
      </div>
      {/* 表单提交 */}
      <Form form={form} component={false}>
        <PublicTable
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowClassName="editable-row"
          dataSource={dataSource}
          columns={columnsData}
          loading={loading}
          bordered
        />
      </Form>
    </>
  ) : (
    <Empty />
  );
};

export default connect(({ studentHandle, loading }) => ({
  queryBankRwaOperationalData: studentHandle.queryBankRwaOperationalData,
  loading: loading.effects['studentHandle/queryBankRwaOperationals'],
  saveLoading: loading.effects['studentHandle/updateBankRwaOperational'],
}))(HandleTable);
