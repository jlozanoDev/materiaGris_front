import { describe, it, expect, vi } from 'vitest'

// Mock the dependencies before importing
vi.mock('@/modules/admin/roles/infrastructure/ApiRoleRepository', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/admin/roles/domain/use-cases/GetRolesUseCase', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/admin/roles/domain/use-cases/GetRoleUseCase', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/admin/roles/domain/use-cases/CreateRoleUseCase', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/admin/roles/domain/use-cases/UpdateRoleUseCase', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/admin/roles/domain/use-cases/DeleteRoleUseCase', () => ({
  default: vi.fn(),
}))

import ApiRoleRepository from '@/modules/admin/roles/infrastructure/ApiRoleRepository'
import GetRolesUseCase from '@/modules/admin/roles/domain/use-cases/GetRolesUseCase'
import GetRoleUseCase from '@/modules/admin/roles/domain/use-cases/GetRoleUseCase'
import CreateRoleUseCase from '@/modules/admin/roles/domain/use-cases/CreateRoleUseCase'
import UpdateRoleUseCase from '@/modules/admin/roles/domain/use-cases/UpdateRoleUseCase'
import DeleteRoleUseCase from '@/modules/admin/roles/domain/use-cases/DeleteRoleUseCase'

import {
  provideGetRolesUseCase,
  provideGetRoleUseCase,
  provideCreateRoleUseCase,
  provideUpdateRoleUseCase,
  provideDeleteRoleUseCase,
} from '@/modules/admin/roles/application/containers/rolesContainer'

describe('rolesContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('provideGetRolesUseCase', () => {
    it('creates ApiRoleRepository and returns a GetRolesUseCase', () => {
      const mockRepo = {}
      const mockUseCase = {}
      ApiRoleRepository.mockReturnValue(mockRepo)
      GetRolesUseCase.mockReturnValue(mockUseCase)

      const result = provideGetRolesUseCase()

      expect(ApiRoleRepository).toHaveBeenCalledTimes(1)
      expect(GetRolesUseCase).toHaveBeenCalledWith(mockRepo)
      expect(result).toBe(mockUseCase)
    })
  })

  describe('provideGetRoleUseCase', () => {
    it('creates ApiRoleRepository and returns a GetRoleUseCase', () => {
      const mockRepo = {}
      const mockUseCase = {}
      ApiRoleRepository.mockReturnValue(mockRepo)
      GetRoleUseCase.mockReturnValue(mockUseCase)

      const result = provideGetRoleUseCase()

      expect(ApiRoleRepository).toHaveBeenCalledTimes(1)
      expect(GetRoleUseCase).toHaveBeenCalledWith(mockRepo)
      expect(result).toBe(mockUseCase)
    })
  })

  describe('provideCreateRoleUseCase', () => {
    it('creates ApiRoleRepository and returns a CreateRoleUseCase', () => {
      const mockRepo = {}
      const mockUseCase = {}
      ApiRoleRepository.mockReturnValue(mockRepo)
      CreateRoleUseCase.mockReturnValue(mockUseCase)

      const result = provideCreateRoleUseCase()

      expect(ApiRoleRepository).toHaveBeenCalledTimes(1)
      expect(CreateRoleUseCase).toHaveBeenCalledWith(mockRepo)
      expect(result).toBe(mockUseCase)
    })
  })

  describe('provideUpdateRoleUseCase', () => {
    it('creates ApiRoleRepository and returns a UpdateRoleUseCase', () => {
      const mockRepo = {}
      const mockUseCase = {}
      ApiRoleRepository.mockReturnValue(mockRepo)
      UpdateRoleUseCase.mockReturnValue(mockUseCase)

      const result = provideUpdateRoleUseCase()

      expect(ApiRoleRepository).toHaveBeenCalledTimes(1)
      expect(UpdateRoleUseCase).toHaveBeenCalledWith(mockRepo)
      expect(result).toBe(mockUseCase)
    })
  })

  describe('provideDeleteRoleUseCase', () => {
    it('creates ApiRoleRepository and returns a DeleteRoleUseCase', () => {
      const mockRepo = {}
      const mockUseCase = {}
      ApiRoleRepository.mockReturnValue(mockRepo)
      DeleteRoleUseCase.mockReturnValue(mockUseCase)

      const result = provideDeleteRoleUseCase()

      expect(ApiRoleRepository).toHaveBeenCalledTimes(1)
      expect(DeleteRoleUseCase).toHaveBeenCalledWith(mockRepo)
      expect(result).toBe(mockUseCase)
    })
  })
})
