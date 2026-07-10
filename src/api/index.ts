import { httpClient } from './httpClient';
import type {
  BlogCategoryDto, BlogCategoryRequest, BlogDetailDto, BlogDto, BlogRequest,
  CertificateDto, CertificateRequest, ContactMessageDto, CurrentAdmin, EducationDto, EducationRequest,
  ExperienceDto, ExperienceRequest, FileUrlResponse, LoginResponse, OperationResult, PagedResult,
  ProfileDto, ProfileRequest, ProjectDetailDto, ProjectDto, ProjectImageDto, ProjectRequest,
  SettingDto, SettingRequest, SkillCategoryDto, SkillCategoryRequest, SkillDto, SkillRequest,
  UploadedFileDto, UserCreateRequest, UserDto, UserUpdateRequest
} from '@/types';

const fileForm = (file: File, extra?: Record<string, string | number>) => {
  const form = new FormData();
  form.append('file', file);
  Object.entries(extra ?? {}).forEach(([key, value]) => form.append(key, String(value)));
  return form;
};

export const authApi = {
  async login(request: { email: string; password: string }) {
    return (await httpClient.post<LoginResponse>('/api/auth/login', request)).data;
  },
  async me() { return (await httpClient.get<CurrentAdmin>('/api/auth/me')).data; },
  async logout() { await httpClient.post('/api/auth/logout'); }
};

export const api = {
  dashboard: async () => {
    const [projects, skills, contacts, blogs] = await Promise.all([
      httpClient.get<PagedResult<ProjectDto>>('/api/v1/admin/projects', { params: { page: 1, pageSize: 1 } }),
      httpClient.get<PagedResult<SkillDto>>('/api/v1/admin/skills', { params: { page: 1, pageSize: 1 } }),
      httpClient.get<PagedResult<ContactMessageDto>>('/api/v1/admin/contact-messages', { params: { page: 1, pageSize: 1 } }),
      httpClient.get<PagedResult<BlogDto>>('/api/v1/admin/blogs', { params: { page: 1, pageSize: 1 } })
    ]);
    return { projects: projects.data.totalCount, skills: skills.data.totalCount, contacts: contacts.data.totalCount, blogs: blogs.data.totalCount };
  },
  profile: {
    get: async () => (await httpClient.get<ProfileDto>('/api/v1/admin/profile')).data,
    update: async (request: ProfileRequest) => (await httpClient.put<ProfileDto>('/api/v1/admin/profile', request)).data,
    upload: async (type: 'avatar' | 'banner' | 'cv', file: File) => (await httpClient.post<FileUrlResponse>(`/api/v1/admin/profile/${type}`, fileForm(file))).data,
    remove: async (type: 'avatar' | 'banner' | 'cv') => { await httpClient.delete(`/api/v1/admin/profile/${type}`); }
  },
  skillCategories: {
    list: async () => (await httpClient.get<SkillCategoryDto[]>('/api/v1/admin/skill-categories')).data,
    create: async (request: SkillCategoryRequest) => (await httpClient.post<SkillCategoryDto>('/api/v1/admin/skill-categories', request)).data,
    update: async (id: number, request: SkillCategoryRequest) => (await httpClient.put<SkillCategoryDto>(`/api/v1/admin/skill-categories/${id}`, request)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/skill-categories/${id}`)).data
  },
  skills: {
    list: async (params: Record<string, unknown>) => (await httpClient.get<PagedResult<SkillDto>>('/api/v1/admin/skills', { params })).data,
    create: async (request: SkillRequest) => (await httpClient.post<SkillDto>('/api/v1/admin/skills', request)).data,
    update: async (id: number, request: SkillRequest) => (await httpClient.put<SkillDto>(`/api/v1/admin/skills/${id}`, request)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/skills/${id}`)).data,
    toggleActive: async (id: number) => (await httpClient.patch<SkillDto>(`/api/v1/admin/skills/${id}/toggle-active`)).data,
    toggleFeatured: async (id: number) => (await httpClient.patch<SkillDto>(`/api/v1/admin/skills/${id}/toggle-featured`)).data
  },
  projects: {
    list: async (params: Record<string, unknown>) => (await httpClient.get<PagedResult<ProjectDto>>('/api/v1/admin/projects', { params })).data,
    get: async (id: number) => (await httpClient.get<ProjectDetailDto>(`/api/v1/admin/projects/${id}`)).data,
    create: async (request: ProjectRequest) => (await httpClient.post<ProjectDto>('/api/v1/admin/projects', request)).data,
    update: async (id: number, request: ProjectRequest) => (await httpClient.put<ProjectDto>(`/api/v1/admin/projects/${id}`, request)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/projects/${id}`)).data,
    toggleActive: async (id: number) => (await httpClient.patch<ProjectDto>(`/api/v1/admin/projects/${id}/toggle-active`)).data,
    toggleFeatured: async (id: number) => (await httpClient.patch<ProjectDto>(`/api/v1/admin/projects/${id}/toggle-featured`)).data,
    uploadThumbnail: async (id: number, file: File) => (await httpClient.post<FileUrlResponse>(`/api/v1/admin/projects/${id}/thumbnail`, fileForm(file))).data,
    uploadImage: async (projectId: number, file: File, caption = '', displayOrder = 0) => (await httpClient.post<ProjectImageDto>(`/api/v1/admin/projects/${projectId}/images`, fileForm(file, { caption, displayOrder }))).data,
    removeImage: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/project-images/${id}`)).data,
    setThumbnail: async (id: number) => (await httpClient.patch<OperationResult>(`/api/v1/admin/project-images/${id}/set-thumbnail`)).data
  },
  experiences: {
    list: async (params?: Record<string, unknown>) => (await httpClient.get<ExperienceDto[]>('/api/v1/admin/experiences', { params })).data,
    create: async (request: ExperienceRequest) => (await httpClient.post<ExperienceDto>('/api/v1/admin/experiences', request)).data,
    update: async (id: number, request: ExperienceRequest) => (await httpClient.put<ExperienceDto>(`/api/v1/admin/experiences/${id}`, request)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/experiences/${id}`)).data
  },
  education: {
    list: async () => (await httpClient.get<EducationDto[]>('/api/v1/admin/education')).data,
    create: async (request: EducationRequest) => (await httpClient.post<EducationDto>('/api/v1/admin/education', request)).data,
    update: async (id: number, request: EducationRequest) => (await httpClient.put<EducationDto>(`/api/v1/admin/education/${id}`, request)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/education/${id}`)).data
  },
  certificates: {
    list: async (params?: Record<string, unknown>) => (await httpClient.get<CertificateDto[]>('/api/v1/admin/certificates', { params })).data,
    create: async (request: CertificateRequest) => (await httpClient.post<CertificateDto>('/api/v1/admin/certificates', request)).data,
    update: async (id: number, request: CertificateRequest) => (await httpClient.put<CertificateDto>(`/api/v1/admin/certificates/${id}`, request)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/certificates/${id}`)).data,
    uploadImage: async (id: number, file: File) => (await httpClient.post<FileUrlResponse>(`/api/v1/admin/certificates/${id}/image`, fileForm(file))).data
  },
  blogCategories: {
    list: async () => (await httpClient.get<BlogCategoryDto[]>('/api/v1/admin/blog-categories')).data,
    create: async (request: BlogCategoryRequest) => (await httpClient.post<BlogCategoryDto>('/api/v1/admin/blog-categories', request)).data,
    update: async (id: number, request: BlogCategoryRequest) => (await httpClient.put<BlogCategoryDto>(`/api/v1/admin/blog-categories/${id}`, request)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/blog-categories/${id}`)).data
  },
  blogs: {
    list: async (params: Record<string, unknown>) => (await httpClient.get<PagedResult<BlogDto>>('/api/v1/admin/blogs', { params })).data,
    get: async (id: number) => (await httpClient.get<BlogDetailDto>(`/api/v1/admin/blogs/${id}`)).data,
    create: async (request: BlogRequest) => (await httpClient.post<BlogDto>('/api/v1/admin/blogs', request)).data,
    update: async (id: number, request: BlogRequest) => (await httpClient.put<BlogDto>(`/api/v1/admin/blogs/${id}`, request)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/blogs/${id}`)).data,
    publish: async (id: number) => (await httpClient.patch<BlogDto>(`/api/v1/admin/blogs/${id}/publish`)).data,
    unpublish: async (id: number) => (await httpClient.patch<BlogDto>(`/api/v1/admin/blogs/${id}/unpublish`)).data,
    toggleFeatured: async (id: number) => (await httpClient.patch<BlogDto>(`/api/v1/admin/blogs/${id}/toggle-featured`)).data,
    uploadThumbnail: async (id: number, file: File) => (await httpClient.post<FileUrlResponse>(`/api/v1/admin/blogs/${id}/thumbnail`, fileForm(file))).data
  },
  contacts: {
    list: async (params: Record<string, unknown>) => (await httpClient.get<PagedResult<ContactMessageDto>>('/api/v1/admin/contact-messages', { params })).data,
    get: async (id: number) => (await httpClient.get<ContactMessageDto>(`/api/v1/admin/contact-messages/${id}`)).data,
    markReplied: async (id: number) => (await httpClient.patch<ContactMessageDto>(`/api/v1/admin/contact-messages/${id}/mark-as-replied`)).data,
    archive: async (id: number) => (await httpClient.patch<ContactMessageDto>(`/api/v1/admin/contact-messages/${id}/archive`)).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/contact-messages/${id}`)).data
  },
  users: {
    list: async (params?: Record<string, unknown>) => (await httpClient.get<UserDto[]>('/api/v1/admin/users', { params })).data,
    create: async (request: UserCreateRequest) => (await httpClient.post<UserDto>('/api/v1/admin/users', request)).data,
    update: async (id: number, request: UserUpdateRequest) => (await httpClient.put<UserDto>(`/api/v1/admin/users/${id}`, request)).data,
    lock: async (id: number) => (await httpClient.patch<UserDto>(`/api/v1/admin/users/${id}/lock`)).data,
    unlock: async (id: number) => (await httpClient.patch<UserDto>(`/api/v1/admin/users/${id}/unlock`)).data,
    resetPassword: async (id: number, request: { newPassword: string; confirmPassword: string }) => (await httpClient.patch<OperationResult>(`/api/v1/admin/users/${id}/reset-password`, request)).data
  },
  settings: {
    get: async () => (await httpClient.get<SettingDto>('/api/v1/admin/settings')).data,
    update: async (request: SettingRequest) => (await httpClient.put<SettingDto>('/api/v1/admin/settings', request)).data,
    upload: async (type: 'logo' | 'favicon', file: File) => (await httpClient.post<FileUrlResponse>(`/api/v1/admin/settings/${type}`, fileForm(file))).data
  },
  uploads: {
    image: async (file: File) => (await httpClient.post<UploadedFileDto>('/api/v1/admin/uploads/image', fileForm(file))).data,
    file: async (file: File) => (await httpClient.post<UploadedFileDto>('/api/v1/admin/uploads/file', fileForm(file))).data,
    cv: async (file: File) => (await httpClient.post<UploadedFileDto>('/api/v1/admin/uploads/cv', fileForm(file))).data,
    remove: async (id: number) => (await httpClient.delete<OperationResult>(`/api/v1/admin/uploads/${id}`)).data
  }
};
