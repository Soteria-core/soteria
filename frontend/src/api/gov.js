import request from '@/utils/request'


export const getCategories = () => {
  return request({
    url: `/data/category.json`,
    method: 'get'
  })
}