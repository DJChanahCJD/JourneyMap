// 环境配置
const ENV = {
  development: {
    baseUrl: 'http://127.0.0.1:4523/m1/4662897-4313943-default', // 开发环境
  },
  test: {
    baseUrl: 'https://mock.presstime.cn/mock/6721d44dcaf0b4e52f12b10a', // 测试环境
  },
  production: {
    baseUrl: 'http://8.138.145.205:8080', // 生产环境
  }
};

// 当前环境，可以通过某种方式来切换
const currentEnv = 'production';

export const config = ENV[currentEnv]; 