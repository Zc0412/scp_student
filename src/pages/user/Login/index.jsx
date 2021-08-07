import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { connect, FormattedMessage, history, Link, SelectLang, useIntl, useModel } from 'umi';
import Footer from '@/components/Footer';
import { getLogin, getQueryTenantOptions } from '@/services/login';
import styles from './index.less';

const LoginMessage = ({content}) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login = () => {
  const [submitting, setSubmitting] = useState(false);
  const [userLoginState, setUserLoginState] = useState({});
  const [tenant, setTenant] = useState(undefined);
  const {initialState, setInitialState} = useModel('@@initialState');
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();

    if (userInfo) {
      await setInitialState((s) => ({...s, currentUser: userInfo}));
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // 登录
      const response = await getLogin({...values});
      // console.log(response)

      if (response.status === undefined) {
        const {authorities} = response
        // 当前身份
        const [auth] = authorities
        const defaultloginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultloginSuccessMessage);
        // 考虑意外退出的情况 登录成功后将存储的localStorage清除
        localStorage.clear()
        sessionStorage.setItem('AUTHORITIES_INFO', JSON.stringify(response))
        await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */

        if (!history) return;
        // const {query} = history.location;
        // const {redirect} = query;
        // history.push(redirect || '/');
        if (auth && auth === 'STUDENT') {
          history.push('/student/home');
        } else if (auth && auth === 'TEACHER') {
          history.push('/teacher/classroom');
        }
        return;
      } // 如果失败去设置用户错误信息

      setUserLoginState(response);
    } catch (error) {
      const defaultloginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultloginFailureMessage);
    }

    setSubmitting(false);
  };

  const {status} = userLoginState;
  const formRef = React.createRef(null);
  // 获取下拉列表datalist
  const request = async () => {
    return getQueryTenantOptions()
      .then(tenants => {
        formRef?.current?.setFieldsValue({
          tenantId: tenants.find(() => true)?.id,
        });
        return tenants.map(item => {return {
          label: item.name,
          value: item.id
        }});
      });
  }
  return (
    <div className={styles.container}>
      {/*国际化*/}
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang/>}
      </div>
      <div className={styles.content}>
        {/*头部*/}
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src="/logo.svg"/>
              <span className={styles.title}>奢侈品</span>
            </Link>
          </div>
          {/*<div className={styles.desc}>
            {intl.formatMessage({
              id: 'pages.layouts.userLayout.title',
            })}
          </div>*/}
        </div>

        <div className={styles.main}>
          <ProForm
            formRef={formRef}
            initialValues={{
              "username": "student",
              "password": "123456",
            }}
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({
                  id: 'pages.login.submit',
                  defaultMessage: '登录',
                }),
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: submitting,
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={(values) => {
              handleSubmit(values);
            }}
          >
            <Tabs>
              <Tabs.TabPane
                key="account"
                tab={intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账户密码登录',
                })}
              />
            </Tabs>

            {status === 'error' && (
              <LoginMessage
                content={intl.formatMessage({
                  id: 'pages.login.accountLogin.errorMessage',
                  defaultMessage: '账户或密码错误',
                })}
              />
            )}

            <>
              <ProFormSelect
                name="tenantId"
                fieldProps={{
                  size: 'large',
                }}
                request={request}
                placeholder="请选择租户"
                rules={[{required: true, message: '请选择租户'}]}
              />
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon}/>,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '请输入用户名!',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon}/>,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '请输入密码！',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
            <div
              style={{
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end'
              }}
            >
              <a
                style={{
                  // float: 'right',
                }}
              >
                <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码"/>
              </a>
            </div>
          </ProForm>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default connect()(Login);
