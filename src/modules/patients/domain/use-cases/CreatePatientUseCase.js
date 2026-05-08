export default class CreatePatientUseCase {
  /**
   * @param {import('../repositories/PatientRepository').default} patientRepository
   */
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  /**
   * @param {object} payload
   * @returns {Promise<import('../entities/Patient').default>}
   */
  async execute(payload) {
    return this.patientRepository.create(payload);
  }
}
