import { request } from '../utils/request';
import type { components, paths } from './openapi.gen';

type SuccessResponse<T> = T extends {
  [key: string]: { content: { 'application/json': infer R } };
}
  ? R
  : any;

type RequestBodyOf<T> = T extends { requestBody: { content: { 'application/json': infer B } } } ? B : never;
type QueryOf<T> = T extends { parameters: { query?: infer Q } } ? Q : never;

const PathId = (value: components['parameters']['Id']) => encodeURIComponent(value);
const PathSegment = (value: string) => encodeURIComponent(value);

const buildQueryString = (params?: Record<string, unknown>) => {
  if (!params) return '';
  const parts: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v === undefined || v === null) return;
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
      });
      return;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });
  return parts.length ? `?${parts.join('&')}` : '';
};

export type AuthToken = components['schemas']['AuthToken'];
export type User = components['schemas']['User'];
export type UserUpdate = components['schemas']['UserUpdate'];
export type Content = components['schemas']['Content'];
export type Product = components['schemas']['Product'];
export type SKU = components['schemas']['SKU'];
export type Order = components['schemas']['Order'];
export type OrderCreate = components['schemas']['OrderCreate'];
export type OrderStatus = components['schemas']['OrderStatus'];
export type TraceBatch = components['schemas']['TraceBatch'];
export type Poi = components['schemas']['POI'];
export type Booking = components['schemas']['Booking'];
export type BookingCreate = components['schemas']['BookingCreate'];
export type Paginated<T> = components['schemas']['Paginated'] & { items?: T[] };

export interface HeritageScene {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  preview?: string;
}

export interface HeritageMission {
  id: string;
  title: string;
  description?: string;
  rewardPoints?: number;
}

export interface HeritageBadge {
  id: string;
  title: string;
  icon?: string;
  obtained?: boolean;
}

export interface MemberProfile {
  id: string;
  nickname?: string;
  avatar?: string;
  level?: number;
  levelName?: string;
  points?: number;
  growthValue?: number;
  couponCount?: number;
}

export interface CommunityFeed {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  publishTimeText?: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface MemberTask {
  id: string;
  name: string;
  description?: string;
  rewardPoints?: number;
  status?: string;
  statusLabel?: string;
  deadlineText?: string;
}

export interface PointMallItem {
  id: string;
  title: string;
  cover?: string;
  points: number;
}

export interface StudySession {
  id: string;
  title: string;
  description?: string;
  startTimeText?: string;
  endTimeText?: string;
  location?: string;
  remaining?: number;
  statusLabel?: string;
}

export interface StudyNotice {
  id: string;
  title: string;
  content?: string;
  publishTimeText?: string;
}

export interface EnterpriseProfile {
  companyName?: string;
  licenseNo?: string;
  managerName?: string;
  managerPhone?: string;
  statusLabel?: string;
}

export interface EnterpriseRequirement {
  id: string;
  title: string;
  description?: string;
  statusLabel?: string;
  updatedAtText?: string;
}

export interface EnterpriseContract {
  id: string;
  title: string;
  description?: string;
  statusLabel?: string;
  deadlineText?: string;
  previewUrl?: string;
}

export interface EnterpriseInvoice {
  id: string;
  title: string;
  amount: number;
  typeLabel?: string;
  statusLabel?: string;
  fileUrl?: string;
}

export interface OpsDashboard {
  operations?: {
    onlineSlots?: number;
    slots?: Array<{
      id: string;
      name: string;
      description?: string;
      online?: boolean;
    }>;
  };
  orders?: {
    pending?: number;
  };
  alerts?: {
    today?: number;
  };
  moderation?: {
    pending?: number;
  };
  pendingTasks?: number;
}

export interface OpsTask {
  id: string;
  title: string;
  description?: string;
  typeLabel?: string;
  priorityLabel?: string;
}

export interface OpsLog {
  id: string;
  title: string;
  description?: string;
  timestampText?: string;
}

type LoginOperation = paths['/auth/login']['post'];
type LoginPayload = RequestBodyOf<LoginOperation>;
type LoginResponse = SuccessResponse<LoginOperation['responses']>;

export function loginByCode(payload: LoginPayload) {
  return request<LoginPayload, LoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: payload
  });
}

type MeOperation = paths['/users/me']['get'];
type UpdateMeOperation = paths['/users/me']['put'];
type UserResponse = SuccessResponse<MeOperation['responses']>;
type UserUpdatePayload = RequestBodyOf<UpdateMeOperation>;

export function getCurrentUser() {
  return request<undefined, UserResponse>({
    url: '/users/me',
    auth: true
  });
}

export function updateCurrentUser(payload: UserUpdatePayload) {
  return request<UserUpdatePayload, UserResponse>({
    url: '/users/me',
    method: 'PUT',
    data: payload,
    auth: true
  });
}

type ListContentsOperation = paths['/contents']['get'];
type ListContentsParams = NonNullable<QueryOf<ListContentsOperation>>;
type ListContentsResponse = SuccessResponse<ListContentsOperation['responses']>;

export function listContents(params?: ListContentsParams) {
  const query = buildQueryString(params as unknown as Record<string, unknown> | undefined);
  return request<undefined, ListContentsResponse>({
    url: `/contents${query}`
  });
}

type ListProductsOperation = paths['/products']['get'];
export type ListProductsParams = NonNullable<QueryOf<ListProductsOperation>>;
export type ListProductsResponse = SuccessResponse<ListProductsOperation['responses']>;

export function listProducts(params?: ListProductsParams) {
  const query = buildQueryString(params as unknown as Record<string, unknown> | undefined);
  return request<undefined, ListProductsResponse>({
    url: `/products${query}`
  });
}

type GetProductOperation = paths['/products/{id}']['get'];
type ProductDetailResponse = SuccessResponse<GetProductOperation['responses']>;

export function getProduct(id: components['parameters']['Id']) {
  return request<undefined, ProductDetailResponse>({
    url: `/products/${PathId(id)}`
  });
}

type CreateOrderOperation = paths['/orders']['post'];
type CreateOrderPayload = RequestBodyOf<CreateOrderOperation>;
type CreateOrderResponse = SuccessResponse<CreateOrderOperation['responses']>;

export function createOrder(payload: CreateOrderPayload) {
  return request<CreateOrderPayload, CreateOrderResponse>({
    url: '/orders',
    method: 'POST',
    data: payload,
    auth: true
  });
}

type MyOrdersOperation = paths['/orders']['get'];
export type MyOrdersParams = NonNullable<QueryOf<MyOrdersOperation>>;
export type MyOrdersResponse = SuccessResponse<MyOrdersOperation['responses']>;

export function myOrders(params?: MyOrdersParams) {
  const query = buildQueryString(params as unknown as Record<string, unknown> | undefined);
  return request<undefined, MyOrdersResponse>({
    url: `/orders${query}`,
    auth: true
  });
}

type JsapiPrepayOperation = paths['/pay/jsapi_prepay']['post'];
type JsapiPrepayPayload = RequestBodyOf<JsapiPrepayOperation>;
type JsapiPrepayResponse = SuccessResponse<JsapiPrepayOperation['responses']>;

export function jsapiPrepay(payload: JsapiPrepayPayload) {
  return request<JsapiPrepayPayload, JsapiPrepayResponse>({
    url: '/pay/jsapi_prepay',
    method: 'POST',
    data: payload,
    auth: true
  });
}

type TraceOperation = paths['/trace/{code}']['get'];
type TraceResponse = SuccessResponse<TraceOperation['responses']>;

export function getTrace(code: string) {
  return request<undefined, TraceResponse>({
    url: `/trace/${PathSegment(code)}`
  });
}

export function createTraceFeedback(code: string, payload: { message: string; contact?: string }) {
  return request<typeof payload, { id: string }>({
    url: `/trace/${PathSegment(code)}/feedback`,
    method: 'POST',
    data: payload,
    auth: true
  });
}

type NearbyPoiOperation = paths['/poi/nearby']['get'];
type NearbyPoiResponse = SuccessResponse<NearbyPoiOperation['responses']>;
type NearbyPoiParams = NonNullable<QueryOf<NearbyPoiOperation>>;

export function nearbyPOI(lat: NearbyPoiParams['lat'], lng: NearbyPoiParams['lng'], radius?: NearbyPoiParams['radius']) {
  const query = buildQueryString({
    lat,
    lng,
    ...(radius !== undefined ? { radius } : {})
  });
  return request<undefined, NearbyPoiResponse>({
    url: `/poi/nearby${query}`
  });
}

type CreateBookingOperation = paths['/bookings']['post'];
type CreateBookingPayload = RequestBodyOf<CreateBookingOperation>;
type CreateBookingResponse = SuccessResponse<CreateBookingOperation['responses']>;

export function createBooking(payload: CreateBookingPayload) {
  return request<CreateBookingPayload, CreateBookingResponse>({
    url: '/bookings',
    method: 'POST',
    data: payload,
    auth: true
  });
}

// Heritage experience hall

type HeritageSceneResponse = Paginated<HeritageScene>;
type HeritageMissionResponse = Paginated<HeritageMission>;
type HeritageBadgeResponse = Paginated<HeritageBadge>;

export function listHeritageScenes() {
  return request<undefined, HeritageSceneResponse>({
    url: '/heritage/scenes'
  });
}

export function listHeritageMissions() {
  return request<undefined, HeritageMissionResponse>({
    url: '/heritage/missions',
    auth: true
  });
}

export function listHeritageBadges() {
  return request<undefined, HeritageBadgeResponse>({
    url: '/heritage/badges',
    auth: true
  });
}

// Community & membership

type CommunityFeedResponse = Paginated<CommunityFeed>;
type MemberTaskResponse = Paginated<MemberTask>;
type PointMallResponse = Paginated<PointMallItem>;

export function getMemberProfile() {
  return request<undefined, MemberProfile>({
    url: '/members/profile',
    auth: true
  });
}

export function listCommunityFeeds() {
  return request<undefined, CommunityFeedResponse>({
    url: '/community/feeds',
    auth: true
  });
}

export function listMemberTasks() {
  return request<undefined, MemberTaskResponse>({
    url: '/members/tasks',
    auth: true
  });
}

export function listPointMall() {
  return request<undefined, PointMallResponse>({
    url: '/points/mall',
    auth: true
  });
}

// Study tours

interface ListStudySessionParams {
  date?: string;
}

type StudySessionResponse = Paginated<StudySession>;
type StudyNoticeResponse = Paginated<StudyNotice>;

export function listStudySessions(params?: ListStudySessionParams) {
  const query = buildQueryString(params as Record<string, unknown> | undefined);
  return request<undefined, StudySessionResponse>({
    url: `/studies/sessions${query}`,
    auth: true
  });
}

export function listStudyNotices() {
  return request<undefined, StudyNoticeResponse>({
    url: '/studies/notices',
    auth: true
  });
}

export function createStudyBooking(payload: { sessionId: string }) {
  return request<typeof payload, { id: string }>({
    url: '/studies/bookings',
    method: 'POST',
    data: payload,
    auth: true
  });
}

export function checkInStudySession(payload: { sessionId: string }) {
  return request<typeof payload, { certificateUrl?: string }>({
    url: '/studies/checkins',
    method: 'POST',
    data: payload,
    auth: true
  });
}

// Enterprise services

type EnterpriseRequirementResponse = Paginated<EnterpriseRequirement>;
type EnterpriseContractResponse = Paginated<EnterpriseContract>;
type EnterpriseInvoiceResponse = Paginated<EnterpriseInvoice>;

export function getEnterpriseProfile() {
  return request<undefined, EnterpriseProfile>({
    url: '/enterprise/profile',
    auth: true
  });
}

export function listEnterpriseRequirements() {
  return request<undefined, EnterpriseRequirementResponse>({
    url: '/enterprise/requirements',
    auth: true
  });
}

export function createEnterpriseRequirement(payload: {
  companyName: string;
  contact: string;
  contactPhone: string;
  demand: string;
  budget?: string;
}) {
  return request<typeof payload, { id: string }>({
    url: '/enterprise/requirements',
    method: 'POST',
    data: payload,
    auth: true
  });
}

export function listEnterpriseContracts() {
  return request<undefined, EnterpriseContractResponse>({
    url: '/enterprise/contracts',
    auth: true
  });
}

export function listEnterpriseInvoices() {
  return request<undefined, EnterpriseInvoiceResponse>({
    url: '/enterprise/invoices',
    auth: true
  });
}

// Operations backend

type OpsTaskResponse = Paginated<OpsTask>;
type OpsLogResponse = Paginated<OpsLog>;

export function getOpsDashboard() {
  return request<undefined, OpsDashboard>({
    url: '/ops/dashboard',
    auth: true
  });
}

export function listOpsTasks() {
  return request<undefined, OpsTaskResponse>({
    url: '/ops/tasks',
    auth: true
  });
}

export function listOpsLogs() {
  return request<undefined, OpsLogResponse>({
    url: '/ops/logs',
    auth: true
  });
}

export function updateOpsTaskStatus(payload: { id: string; action: 'approve' | 'reject' | 'done' }) {
  return request<{ action: 'approve' | 'reject' | 'done' }, { success: boolean }>({
    url: `/ops/tasks/${PathId(payload.id)}`,
    method: 'POST',
    data: { action: payload.action },
    auth: true
  });
}

export function toggleOperationSlot(payload: { slotId: string; enable: boolean }) {
  return request<{ enable: boolean }, { success: boolean }>({
    url: `/ops/slots/${PathId(payload.slotId)}/toggle`,
    method: 'POST',
    data: { enable: payload.enable },
    auth: true
  });
}

export function syncInventorySnapshot() {
  return request<undefined, { success: boolean }>({
    url: '/ops/sync/inventory',
    method: 'POST',
    auth: true
  });
}
