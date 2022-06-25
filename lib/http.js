/*
 * @Author: rzh
 * @Date: 2021-10-10 18:35:18
 * @LastEditors: rzh
 * @LastEditTime: 2021-10-10 20:33:23
 * @Description: Do not edit
 */
const axios = require('axios')

axios.interceptors.response.use(res => {
  return res.data;
})


/**
 * 获取模板列表和名称
 * @returns Promise
 */
async function getRepoList() {
  return axios.get('https://gitlab.com/api/v4/groups/13682649/projects')
}

module.exports = {
  getRepoList,
}
