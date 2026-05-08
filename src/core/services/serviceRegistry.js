let _authService = null
let _storageGateway = null

export function setAuthService(svc) {
  _authService = svc
}

export function getAuthService() {
  return _authService
}

export function setStorageGateway(gw) {
  _storageGateway = gw
}

export function getStorageGateway() {
  return _storageGateway
}
