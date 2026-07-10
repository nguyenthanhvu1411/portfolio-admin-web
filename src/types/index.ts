export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OperationResult {
  success: boolean;
  message: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export interface CurrentAdmin {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  roles: string[];
}

export interface LoginResponse {
  tokenType?: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  admin: CurrentAdmin;
}

export enum SkillLevel { Beginner = 1, Intermediate = 2, Advanced = 3 }
export enum ProjectStatus { Planning = 1, InProgress = 2, Completed = 3 }
export enum BlogStatus { Draft = 1, Published = 2, Hidden = 3 }
export enum ContactStatus { New = 1, Read = 2, Replied = 3, Archived = 4 }
export enum UserStatus { Active = 1, Locked = 2, Inactive = 3 }

export interface FileUrlResponse {
  fileId?: number;
  fileUrl: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
}

export interface ProfileDto {
  id: number;
  fullName: string;
  jobTitle: string;
  shortBio?: string | null;
  aboutMe?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  cvUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  isActive: boolean;
}
export type ProfileRequest = Omit<ProfileDto, 'id' | 'avatarUrl' | 'bannerUrl' | 'cvUrl'>;

export interface SkillCategoryDto {
  id: number;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  skillCount: number;
}
export interface SkillCategoryRequest { name: string; description?: string | null; displayOrder: number; isActive: boolean; }

export interface SkillDto {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  level?: SkillLevel | null;
  levelName?: string | null;
  iconUrl?: string | null;
  description?: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  projectCount: number;
}
export type SkillRequest = Omit<SkillDto, 'id' | 'categoryName' | 'levelName' | 'projectCount'>;

export interface ProjectDto {
  id: number;
  projectName: string;
  slug: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  role?: string | null;
  projectType?: string | null;
  thumbnailUrl?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: ProjectStatus;
  statusName: string;
  isFeatured: boolean;
  isActive: boolean;
  skillCount: number;
  imageCount: number;
}
export interface ProjectSkillDto { id: number; name: string; categoryId: number; categoryName: string; level?: SkillLevel | null; levelName?: string | null; iconUrl?: string | null; isActive: boolean; }
export interface ProjectImageDto { id: number; projectId: number; imageUrl: string; caption?: string | null; displayOrder: number; isThumbnail: boolean; }
export interface ProjectDetailDto extends ProjectDto { skills: ProjectSkillDto[]; images: ProjectImageDto[]; }
export interface ProjectRequest {
  projectName: string;
  slug?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  role?: string | null;
  projectType?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: ProjectStatus;
  isFeatured: boolean;
  isActive: boolean;
  skillIds: number[];
}

export interface ExperienceDto {
  id: number;
  position: string;
  company: string;
  companyLogoUrl?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  technologies?: string | null;
  displayOrder: number;
  isActive: boolean;
}
export type ExperienceRequest = Omit<ExperienceDto, 'id'>;

export interface EducationDto {
  id: number;
  schoolName: string;
  major: string;
  degree?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  gpa?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
}
export type EducationRequest = Omit<EducationDto, 'id'>;

export interface CertificateDto {
  id: number;
  name: string;
  organization: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  isActive: boolean;
}
export type CertificateRequest = Omit<CertificateDto, 'id' | 'imageUrl'>;

export interface BlogCategoryDto { id: number; name: string; slug: string; description?: string | null; isActive: boolean; blogCount: number; }
export interface BlogCategoryRequest { name: string; slug?: string | null; description?: string | null; isActive: boolean; }
export interface BlogDto {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  slug: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  status: BlogStatus;
  statusName: string;
  publishedAt?: string | null;
  viewCount: number;
  isFeatured: boolean;
  tags: string[];
}
export interface BlogDetailDto extends BlogDto { content: string; }
export interface BlogRequest { categoryId: number; title: string; slug?: string | null; summary?: string | null; content: string; isFeatured: boolean; tags: string[]; }

export interface ContactMessageDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  statusName: string;
  createdAt: string;
}

export interface UserRoleDto { id: number; name: string; description?: string | null; }
export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  status: UserStatus;
  statusName: string;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  roles: UserRoleDto[];
}
export interface UserCreateRequest { email: string; fullName: string; password: string; status: UserStatus; roleIds: number[]; }
export interface UserUpdateRequest { email: string; fullName: string; avatarUrl?: string | null; status: UserStatus; roleIds: number[]; }

export interface SettingDto {
  id: number;
  siteName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  themeColor?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  contactEmail?: string | null;
  footerText?: string | null;
}
export type SettingRequest = Omit<SettingDto, 'id' | 'logoUrl' | 'faviconUrl'>;

export interface UploadedFileDto extends FileUrlResponse {
  id: number;
  storedFileName: string;
  uploadedBy?: number | null;
  createdAt: string;
}
