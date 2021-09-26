import { grab, queryLogs } from '@/services/student/gdpst.js';
import { message } from 'antd';
import { delay } from '@/utils/commonUtils';

// 存款抢单
const GrabDepositModel = {
  namespace: 'studentGrabDeposit',
  state: {
    grabStatus: undefined, // 抢单状态
    startDuration: undefined, // 抢单开始倒计时
    financialMarketData: [], // 金融市场数据
    logData: [], // 抢单日志数据
  },
  effects: {

    // 倒计时
    * countDown({payload}, {call, put, select}) {
      while (true) {
        const startDuration = yield select(state => state.studentGrabDeposit.startDuration);
        if (startDuration <= 0) {
          break;
        }
        yield call(delay, 1000);
        yield put({
          type: 'save',
          payload:{
            startDuration: startDuration - 1
          }
        })
      }
    },

    // 查询存款抢单记录
    * queryLogs({payload}, {call, put}) {
      const response = yield call(queryLogs, payload)
      if (!response.errCode) {
        const logData = response.map((item, index) => {
          return {
            ...item,
            _key: index
          }
        });

        yield put({
          type: 'save',
          payload: {
            logData,
          }
        })
      }
    },

    // 存款抢单
    * grab({payload, callback}, {call, put}) {
      const response = yield call(grab, payload)
      if (!response.errCode) {
        message.success('抢单成功')
      }
      callback(response)
    },
  },

  reducers: {
    save(state, {payload}) {
      return {
        ...state,
        ...payload,
      }
    },

    // 设置已被抢单的数据
    setGrabbedData(state, {payload}) {
      const classFinancialMarketId = payload
      // 将该条金融数据状态改为已被抢单
      const financialMarketData = state.financialMarketData
        .map(item => {
          if (item.classFinancialMarketId === classFinancialMarketId) {
            return {
              ...item,
              status: 'GRABBED'
            }
          }
          return item
        })
        // 将被抢单的移到数组末尾
        .sort((a, b) => {
          return (a.status === 'NORMAL' ? a.orderNo : a.orderNo + 100000) - (b.status === 'NORMAL' ? b.orderNo: b.orderNo + 100000);
        })




      return {
        ...state,
        financialMarketData,
      }
    },

    // 设置抢单信息
    setGrabInfo(state, {payload}) {
      const { grabStatus, serverTime, startTimes, data, currentUserId } = payload;
      // 距离开始时间=当前用户对应的银行开始时间-服务器时间
      const startDuration = serverTime && startTimes && startTimes[currentUserId]
        && Math.max(0, Math.trunc((startTimes[currentUserId] - serverTime) / 1000))
      const financialMarketData = data
        ?.map((item, index) => {
          return {
            ...item,
            _key: index,
          }
        })
        // 将被抢单的移到数组末尾
        .sort((a, b) => {
          return (a.status === 'NORMAL' ? a.orderNo : a.orderNo + 100000) - (b.status === 'NORMAL' ? b.orderNo: b.orderNo + 100000);
        }) ?? [];
      return {
        ...state,
        grabStatus,
        startDuration,
        financialMarketData,
      }
    },
  }
}
export default GrabDepositModel
