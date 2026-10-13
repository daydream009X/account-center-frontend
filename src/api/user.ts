import myAxios from '@/request'

export type UserType = {
  id: number
  username?: string
  userAccount?: string
  avatarUrl?: string
  gender?: number
  phone?: string
  email?: string
  userStatus?: number
  userRole?: number
  createTime?: string
}

export type UserUpdateParams = Pick<
  UserType,
  'id' | 'username' | 'avatarUrl' | 'gender' | 'phone' | 'email' | 'userStatus' | 'userRole'
> & {
  /** 管理员重置用户密码时使用，留空则不修改 */
  userPassword?: string
}

/**
 * 用户注册
 * @param params
 */
export const userRegister = async (params: Record<string, unknown>) => {
  return myAxios.request({
    url: '/api/user/register',
    method: 'POST',
    data: params,
  })
}

/**
 * 用户登录
 * @param params
 */
export const userLogin = async (params: Record<string, unknown>) => {
  return myAxios.request({
    url: '/api/user/login',
    method: 'POST',
    data: params,
  })
}

/**
 * 用户注销
 * @param params
 */
export const userLogout = async (params: Record<string, unknown>) => {
  return myAxios.request({
    url: '/api/user/logout',
    method: 'POST',
    data: params,
  })
}

/**
 * 获取当前用户
 */
export const getCurrentUser = async () => {
  return myAxios.request({
    url: '/api/user/current',
    method: 'GET',
  })
}

/**
 * 获取用户列表
 * @param username
 */
export const searchUsers = async (username: string) => {
  return myAxios.request({
    url: '/api/user/search',
    method: 'GET',
    params: {
      username,
    },
  })
}

/**
 * 删除用户
 * @param id
 */
export const deleteUser = async (id: string) => {
  return myAxios.request({
    url: '/api/user/delete',
    method: 'POST',
    data: id,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 更新用户信息
 */
export const updateUser = async (params: UserUpdateParams) => {
  return myAxios.request({
    url: '/api/user/update',
    method: 'POST',
    data: params,
  })
}

export type UserProfileUpdateParams = {
  username?: string
  avatarUrl?: string
  gender?: number
  phone?: string
  email?: string
}

/**
 * 更新当前登录用户的个人资料
 * @param params
 */
export const updateProfile = async (params: UserProfileUpdateParams) => {
  return myAxios.request({
    url: '/api/user/profile/update',
    method: 'POST',
    data: params,
  })
}

export type UserPasswordUpdateParams = {
  oldPassword: string
  newPassword: string
  checkPassword: string
}

/**
 * 修改当前登录用户的密码
 * @param params
 */
export const updatePassword = async (params: UserPasswordUpdateParams) => {
  return myAxios.request({
    url: '/api/user/password/update',
    method: 'POST',
    data: params,
  })
}
