export default class PatientRepository {
  /**
   * Search patients with optional filters.
   * @param {{ q?: string, age_min?: number, age_max?: number, gender?: string, city?: string, insurance?: string[], registered_from?: string, registered_to?: string, last_visit_from?: string, last_visit_to?: string, is_active?: string }} filters
   * @returns {Promise<Patient[]>}
   */
  async search(_filters) {
    throw new Error("Not implemented");
  }

  /**
   * Create a new patient.
   * @param {object} payload
   * @returns {Promise<Patient>}
   */
  async create(_payload) {
    throw new Error("Not implemented");
  }

  /**
   * Update an existing patient.
   * @param {number|string} id
   * @param {object} payload
   * @returns {Promise<Patient>}
   */
  async update(_id, _payload) {
    throw new Error("Not implemented");
  }
}
