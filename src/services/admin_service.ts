import axiosInstance from '@/network/core/axiosInstance';

export interface CounsellorPayload {
  firstName: string;
  lastName: string;
  contactNo: number;
  email: string;
  password: string;
  qualifications: string;
  specialization?: string[];
  availability: string;
}

export interface Counsellor extends Omit<CounsellorPayload, 'password'> {
  _id: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

const adminService = {
  async listCounsellors(): Promise<{ success: boolean; counsellors: Counsellor[] }> {
    const res = await axiosInstance.get('/api/admin/counsellor');
    return res.data;
  },

  async createCounsellor(payload: CounsellorPayload): Promise<any> {
    const res = await axiosInstance.post('/api/admin/counsellor', payload);
    return res.data;
  },

  async updateCounsellor(id: string, updates: Partial<CounsellorPayload>): Promise<any> {
    const res = await axiosInstance.put(`/api/admin/counsellor/${id}`, updates);
    return res.data;
  },

  async deleteCounsellor(id: string): Promise<any> {
    const res = await axiosInstance.delete(`/api/admin/counsellor/${id}`);
    return res.data;
  },
};

export default adminService;
