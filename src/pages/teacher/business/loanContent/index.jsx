import React, { useEffect } from 'react';
import { connect } from 'umi';
import PublicTable from '@/components/Table';
import Tags from '@/components/Tags';
import Million from '@/components/Million';
import { toPercent } from '@/utils/commonUtils';

const LoanContent = (props) => {
  const { dispatch, loading } = props;

  const bizType = 'LOAN';
  const {
    queryBankGrabDetailDataList: { [bizType]: dataSource },
  } = props;

  // 获取课堂id
  const { classHourId } = JSON.parse(localStorage.getItem('TEACHER_IN_CLASS')) || {};
  useEffect(() => {
    // 查询银行抢单记录
    if (classHourId) {
      dispatch({
        type: 'teacherBusiness/queryBankGrabDetails',
        payload: { classHourId, bizType },
      });
    }
  }, [bizType]);
  const columns = [
    {
      title: '所属期数',
      dataIndex: 'period',
      render: (period) => `第${period}期`,
    },
    {
      title: '业务类型',
      dataIndex: 'loanTypeName',
      render: (loanTypeName) => <Tags>{loanTypeName}</Tags>,
    },
    {
      title: '金额(万元)',
      dataIndex: 'amount',
      render: (amount) => <Million>{amount}</Million>,
    },
    {
      title: '利率',
      dataIndex: 'expectRate',
      render: (val) => toPercent(val),
    },
    {
      title: '期限',
      dataIndex: 'term',
    },
    {
      title: '贷款分类',
      dataIndex: 'creditRating',
    },
    {
      title: '利率类型',
      dataIndex: 'rateTypeName',
      render: (rateTypeName) => <Tags>{rateTypeName}</Tags>,
    },
    {
      title: '质押/担保金额(万元)',
      dataIndex: 'mgMoney',
      render: (amount) => <Million>{amount}</Million>,
    },
    {
      title: '渠道类型',
      dataIndex: 'channelName',
    },
    {
      title: '区域',
      dataIndex: 'regionName',
    },
  ];
  return <PublicTable dataSource={dataSource} columns={columns} loading={loading} bordered />;
};

export default connect(({ teacherBusiness, loading }) => ({
  queryBankGrabDetailDataList: teacherBusiness.queryBankGrabDetailDataList,
  loading: loading.effects['teacherBusiness/queryBankGrabDetails'],
}))(LoanContent);
