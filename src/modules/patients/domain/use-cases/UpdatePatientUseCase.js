export default class UpdatePatientUseCase {
  /**
   * @param {import('../repositories/PatientRepository').default} patientRepository
   */
  constructor(patientRepository) {
    this.patientRepository = patientRepository
  }

  /**
   * @param {number|string} id
   * @param {object} payload
   */
  async execute(id, payload) {
    return this.patientRepository.update(id, payload)
  }
}
