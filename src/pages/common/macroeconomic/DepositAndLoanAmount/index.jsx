import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts/core';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { queryDepositAndLoanAmount } from '@/services/common/me';
import { Empty, Spin } from 'antd';

echarts.use([
  DatasetComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

const DepositAndLoanAmount = () => {
  const [loading, setLoading] = useState(false);

  // 获取课堂id
  const { classHourId } =
    JSON.parse(localStorage.getItem('STUDENT_IN_CLASS')) ||
    JSON.parse(localStorage.getItem('TEACHER_IN_CLASS')) ||
    {};

  const initEchart = (data) => {
    const option = {
      legend: {},
      tooltip: {},
      dataset: {
        source: data,
      },
      xAxis: { type: 'category' },
      yAxis: {},
      // Declare several bar series, each will be mapped
      // to a column of dataset.source by default.
      series: [{ type: 'bar' }, { type: 'bar' }],
    };

    const chartDom = document.getElementById('dpstAndLoanAmount');
    const myChart = echarts.init(chartDom);
    myChart.setOption(option);
  };

  useEffect(() => {
    if (classHourId) {
      setLoading(true);
      queryDepositAndLoanAmount({ classHourId })
        .then(initEchart)
        .finally(() => setLoading(false));
    }
  }, [classHourId]);

  return (
    <>
      {classHourId ? (
        <Spin spinning={loading}>
          <div id="dpstAndLoanAmount" style={{ height: 400 }} />
        </Spin>
      ) : (
        <Empty />
      )}
    </>
  );
};

export default DepositAndLoanAmount;
