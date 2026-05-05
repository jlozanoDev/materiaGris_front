import { describe, it, expect, vi } from 'vitest'
import GetAllUsersUseCase from '@/modules/admin/users/domain/use-cases/GetAllUsersUseCase'

describe('GetAllUsersUseCase', () => {
  it('delegates to userRepository.all and returns users', async () => {
    const fakeUsers = [{ id: 1, name: 'Alice', email: 'alice@example.com' }]
    const repoMock = { all: vi.fn(() => Promise.resolve(fakeUsers)) }
    const useCase = new GetAllUsersUseCase(repoMock)
    const result = await useCase.execute()
    expect(repoMock.all).toHaveBeenCalled()
    expect(result).toEqual(fakeUsers)
  })
})
