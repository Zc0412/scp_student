import {
  getStudentCreateBankChannel, getStudentInputMarketingCost,
  getStudentQueryBankChannels, getStudentQueryBankMarketings,
  getStudentQueryBankPlan, getStudentQueryCurBankMarketing
} from "@/services/student/plan";
import {message} from "antd";

const PlanModel = {
  namespace: 'studentPlan',
  state: {
    bankChannelsData: [],
    bankMarketingData: [],
    bankMarketingsData:[]
  },
  effects: {
    // 查询银行战略规划
    * queryBankPlan({payload}, {call, put, select}) {
      const response = yield call(getStudentQueryBankPlan, payload)
      if (!response.errCode) {

      }
    },
    // 查询银行渠道
    * queryBankChannels({payload}, {call, put,}) {
      const response = yield call(getStudentQueryBankChannels, payload)
      if (!response.errCode) {
        const bankChannelsData = response.map((item, index) => {
          return {
            ...item,
            _key: index
          }
        });
        yield put({
          type: 'save',
          payload: {
            bankChannelsData
          }
        })
      }
    },
    // 创建银行渠道
    * createBankChannel({payload}, {call, put,}) {
      const response = yield call(getStudentCreateBankChannel, payload)
      if (!response.errCode) {
        message.success('建设成功')
        // 获取课堂id
        const {classHourId} = JSON.parse(localStorage.getItem('STUDENT_IN_CLASS')) || {}
        // 建设成功后刷新表格
        yield put({
          type: 'queryBankChannels',
          payload: {
            classHourId
          }
        })
      }
    },
    // 根据银行ID查询当前期间银行营销信息
    * queryCurBankMarketing({payload}, {call, put,}) {
      const response = yield call(getStudentQueryCurBankMarketing, payload)
      if (!response.errCode) {
        const bankMarketingData = response.map((item, index) => {
          return {
            ...item,
            _key: index
          }
        });
        yield put({
          type: 'save',
          payload: {
            bankMarketingData
          }
        })
      }
    },
    // 投入营销费用
    * inputMarketingCost({payload}, {call}) {
      const response = yield call(getStudentInputMarketingCost, payload)
      if (!response.errCode) {
        message.success('提交成功')
      }
    },
    // 查询往期投入
    * queryBankMarketings({payload}, {call, put,}) {
      const response = yield call(getStudentQueryBankMarketings, payload)
      if (!response.errCode) {
        const bankMarketingsData = response.map((item, index) => {
          return {
            ...item,
            _key: index
          }
        });
        yield put({
          type: 'save',
          payload: {
            bankMarketingsData
          }
        })
      }
    },
  },
  reducers: {
    save(state, {payload}) {
      return {
        ...state,
        ...payload,
      }
    }
  }
}
export default PlanModel
