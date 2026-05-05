export default class SearchPatientsUseCase {
  /**
   * @param {import('../repositories/PatientRepository').default} patientRepository
   */
  constructor(patientRepository) {
    this.patientRepository = patientRepository
  }

  /**
   * @param {object} filters
   * @returns {Promise<import('../entities/Patient').default[]>}
   */
  async execute(filters = {}) {
    return this.patientRepository.search(filters)
  }
}
