import request from '@/utils/request'

export const getStakeProjects = (vue) => {
  return request({
      url:`/data/contracts.json`,
      method:'get'
  })
}
