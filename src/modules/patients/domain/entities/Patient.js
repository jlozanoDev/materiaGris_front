export default class Patient {
  constructor({
    id,
    medical_record_number,
    national_id,
    first_name,
    last_name,
    second_last_name,
    gender,
    date_of_birth,
    city,
    insurance_id,
    is_active,
  } = {}) {
    this.id = id
    this.medical_record_number = medical_record_number
    this.national_id = national_id
    this.first_name = first_name
    this.last_name = last_name
    this.second_last_name = second_last_name
    this.gender = gender
    this.date_of_birth = date_of_birth
    this.city = city
    this.insurance_id = insurance_id
    this.is_active = is_active
  }
}
