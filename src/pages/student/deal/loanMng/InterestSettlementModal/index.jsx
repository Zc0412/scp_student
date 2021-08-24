import React from 'react';
import {connect} from 'umi'
import PublicTable from "@/components/Table";
import {Modal} from "antd";

const InterestSettlementModal = (props) => {
  const {modalVisible, handleCancelModal, loading, dispatch, confirmLoading} = props;
  const {bankFinancialBusinessId, dataSource} = props;
  const {classHourId} = JSON.parse(localStorage.getItem('STUDENT_IN_CLASS')) || {}
  // 保存存款利息
  const updateLoanInterest = () => {
    if (dataSource) {
      // 当期计算利息总和
      const interest = dataSource.map(item => item.interest).reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);
      dispatch({
        type: 'studentLoanMng/updateLoanInterest',
        // bankFinancialBusinessInstId 取值有点疑问
        payload: {classHourId, bankFinancialBusinessInstId, interest},
        callback: () => handleCancelModal()
      })
    }
  }
  // 表头
  const columns = [
    {
      title: '期间',
      dataIndex: 'period',
      key: 'period',
      render: (period) => `第${period}期`
    },
    {
      title: '利息支出(万元)',
      dataIndex: 'interest',
      key: 'interest',
      render: (interest) => `${interest / 10000}`,
    }
  ];
  return (
    <Modal
      visible={modalVisible}
      onCancel={handleCancelModal}
      onOk={updateLoanInterest}
      title='利息结算'
      confirmLoading={confirmLoading}
    >
      <PublicTable
        dataSource={dataSource}
        columns={columns}
        bordered
        scroll={{x: null}}
        loading={loading}
      />
    </Modal>
  );
};

export default connect(({studentLoanMng, loading}) => ({
  dataSource: studentLoanMng.queryLoanInterestsData,
  confirmLoading: loading.effects['studentLoanMng/updateLoanInterest'],
  loading: loading.effects['studentLoanMng/queryLoans']
}))(InterestSettlementModal);
