"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginByCode = loginByCode;
exports.getCurrentUser = getCurrentUser;
exports.updateCurrentUser = updateCurrentUser;
exports.listContents = listContents;
exports.listProducts = listProducts;
exports.getProduct = getProduct;
exports.createOrder = createOrder;
exports.myOrders = myOrders;
exports.jsapiPrepay = jsapiPrepay;
exports.getTrace = getTrace;
exports.createTraceFeedback = createTraceFeedback;
exports.nearbyPOI = nearbyPOI;
exports.createBooking = createBooking;
exports.listHeritageScenes = listHeritageScenes;
exports.listHeritageMissions = listHeritageMissions;
exports.listHeritageBadges = listHeritageBadges;
exports.getMemberProfile = getMemberProfile;
exports.listCommunityFeeds = listCommunityFeeds;
exports.listMemberTasks = listMemberTasks;
exports.listPointMall = listPointMall;
exports.listStudySessions = listStudySessions;
exports.listStudyNotices = listStudyNotices;
exports.createStudyBooking = createStudyBooking;
exports.checkInStudySession = checkInStudySession;
exports.getEnterpriseProfile = getEnterpriseProfile;
exports.listEnterpriseRequirements = listEnterpriseRequirements;
exports.createEnterpriseRequirement = createEnterpriseRequirement;
exports.listEnterpriseContracts = listEnterpriseContracts;
exports.listEnterpriseInvoices = listEnterpriseInvoices;
exports.getOpsDashboard = getOpsDashboard;
exports.listOpsTasks = listOpsTasks;
exports.listOpsLogs = listOpsLogs;
exports.updateOpsTaskStatus = updateOpsTaskStatus;
exports.toggleOperationSlot = toggleOperationSlot;
exports.syncInventorySnapshot = syncInventorySnapshot;
const request_1 = require("../utils/request");
const PathId = (value) => encodeURIComponent(value);
const PathSegment = (value) => encodeURIComponent(value);
const buildQueryString = (params) => {
    if (!params)
        return '';
    const parts = [];
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null)
            return;
        if (Array.isArray(value)) {
            value.forEach((v) => {
                if (v === undefined || v === null)
                    return;
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
            });
            return;
        }
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    });
    return parts.length ? `?${parts.join('&')}` : '';
};
function loginByCode(payload) {
    return (0, request_1.request)({
        url: '/auth/login',
        method: 'POST',
        data: payload
    });
}
function getCurrentUser() {
    return (0, request_1.request)({
        url: '/users/me',
        auth: true
    });
}
function updateCurrentUser(payload) {
    return (0, request_1.request)({
        url: '/users/me',
        method: 'PUT',
        data: payload,
        auth: true
    });
}
function listContents(params) {
    const query = buildQueryString(params);
    return (0, request_1.request)({
        url: `/contents${query}`
    });
}
function listProducts(params) {
    const query = buildQueryString(params);
    return (0, request_1.request)({
        url: `/products${query}`
    });
}
function getProduct(id) {
    return (0, request_1.request)({
        url: `/products/${PathId(id)}`
    });
}
function createOrder(payload) {
    return (0, request_1.request)({
        url: '/orders',
        method: 'POST',
        data: payload,
        auth: true
    });
}
function myOrders(params) {
    const query = buildQueryString(params);
    return (0, request_1.request)({
        url: `/orders${query}`,
        auth: true
    });
}
function jsapiPrepay(payload) {
    return (0, request_1.request)({
        url: '/pay/jsapi_prepay',
        method: 'POST',
        data: payload,
        auth: true
    });
}
function getTrace(code) {
    return (0, request_1.request)({
        url: `/trace/${PathSegment(code)}`
    });
}
function createTraceFeedback(code, payload) {
    return (0, request_1.request)({
        url: `/trace/${PathSegment(code)}/feedback`,
        method: 'POST',
        data: payload,
        auth: true
    });
}
function nearbyPOI(lat, lng, radius) {
    const query = buildQueryString(Object.assign({ lat,
        lng }, (radius !== undefined ? { radius } : {})));
    return (0, request_1.request)({
        url: `/poi/nearby${query}`
    });
}
function createBooking(payload) {
    return (0, request_1.request)({
        url: '/bookings',
        method: 'POST',
        data: payload,
        auth: true
    });
}
function listHeritageScenes() {
    return (0, request_1.request)({
        url: '/heritage/scenes'
    });
}
function listHeritageMissions() {
    return (0, request_1.request)({
        url: '/heritage/missions',
        auth: true
    });
}
function listHeritageBadges() {
    return (0, request_1.request)({
        url: '/heritage/badges',
        auth: true
    });
}
function getMemberProfile() {
    return (0, request_1.request)({
        url: '/members/profile',
        auth: true
    });
}
function listCommunityFeeds() {
    return (0, request_1.request)({
        url: '/community/feeds',
        auth: true
    });
}
function listMemberTasks() {
    return (0, request_1.request)({
        url: '/members/tasks',
        auth: true
    });
}
function listPointMall() {
    return (0, request_1.request)({
        url: '/points/mall',
        auth: true
    });
}
function listStudySessions(params) {
    const query = buildQueryString(params);
    return (0, request_1.request)({
        url: `/studies/sessions${query}`,
        auth: true
    });
}
function listStudyNotices() {
    return (0, request_1.request)({
        url: '/studies/notices',
        auth: true
    });
}
function createStudyBooking(payload) {
    return (0, request_1.request)({
        url: '/studies/bookings',
        method: 'POST',
        data: payload,
        auth: true
    });
}
function checkInStudySession(payload) {
    return (0, request_1.request)({
        url: '/studies/checkins',
        method: 'POST',
        data: payload,
        auth: true
    });
}
function getEnterpriseProfile() {
    return (0, request_1.request)({
        url: '/enterprise/profile',
        auth: true
    });
}
function listEnterpriseRequirements() {
    return (0, request_1.request)({
        url: '/enterprise/requirements',
        auth: true
    });
}
function createEnterpriseRequirement(payload) {
    return (0, request_1.request)({
        url: '/enterprise/requirements',
        method: 'POST',
        data: payload,
        auth: true
    });
}
function listEnterpriseContracts() {
    return (0, request_1.request)({
        url: '/enterprise/contracts',
        auth: true
    });
}
function listEnterpriseInvoices() {
    return (0, request_1.request)({
        url: '/enterprise/invoices',
        auth: true
    });
}
function getOpsDashboard() {
    return (0, request_1.request)({
        url: '/ops/dashboard',
        auth: true
    });
}
function listOpsTasks() {
    return (0, request_1.request)({
        url: '/ops/tasks',
        auth: true
    });
}
function listOpsLogs() {
    return (0, request_1.request)({
        url: '/ops/logs',
        auth: true
    });
}
function updateOpsTaskStatus(payload) {
    return (0, request_1.request)({
        url: `/ops/tasks/${PathId(payload.id)}`,
        method: 'POST',
        data: { action: payload.action },
        auth: true
    });
}
function toggleOperationSlot(payload) {
    return (0, request_1.request)({
        url: `/ops/slots/${PathId(payload.slotId)}/toggle`,
        method: 'POST',
        data: { enable: payload.enable },
        auth: true
    });
}
function syncInventorySnapshot() {
    return (0, request_1.request)({
        url: '/ops/sync/inventory',
        method: 'POST',
        auth: true
    });
}
