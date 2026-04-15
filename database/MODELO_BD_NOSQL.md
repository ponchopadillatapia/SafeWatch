# Modelo de Base de Datos NoSQL - ShieldTech
## MongoDB Atlas

### Colecciones

#### 1. users
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (bcrypt hash)",
  "role": "string (paciente | doctor | admin)",
  "doctor_id": "ObjectId | null (referencia a users)",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

#### 2. medical_profiles
```json
{
  "_id": "ObjectId",
  "user_id": "string (referencia a users)",
  "blood_type": "string (A+, A-, B+, B-, AB+, AB-, O+, O-)",
  "gender": "string (masculino, femenino, otro, prefiero_no_decir)",
  "curp": "string (18 caracteres)",
  "birth_date": "ISODate",
  "height": "number (cm)",
  "weight": "number (kg)",
  "allergies": "string",
  "chronic_conditions": "string",
  "medications": "string",
  "emergency_contact_name": "string",
  "emergency_contact_phone": "string",
  "emergency_contact_relation": "string",
  "emergency_contact2_name": "string",
  "emergency_contact2_phone": "string",
  "emergency_contact2_relation": "string",
  "insurance_provider": "string",
  "insurance_number": "string",
  "home_address": "string",
  "home_latitude": "number",
  "home_longitude": "number",
  "doctor_name": "string",
  "doctor_phone": "string",
  "doctor_specialty": "string",
  "doctor_hospital": "string",
  "notes": "string",
  "privacy_accepted": "boolean",
  "privacy_accepted_at": "ISODate",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

#### 3. vital_signs
```json
{
  "_id": "ObjectId",
  "user_id": "string (referencia a users)",
  "heart_rate": "integer (BPM)",
  "blood_pressure_systolic": "integer (mmHg)",
  "blood_pressure_diastolic": "integer (mmHg)",
  "temperature": "number (Celsius)",
  "oxygen_saturation": "integer (%)",
  "steps": "integer",
  "latitude": "number",
  "longitude": "number",
  "recorded_at": "ISODate",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

#### 4. alerts
```json
{
  "_id": "ObjectId",
  "user_id": "string (referencia a users)",
  "type": "string (sos, heart_rate, oxygen, temperature, blood_pressure, fall_detected)",
  "severity": "string (low, medium, high, critical)",
  "message": "string",
  "latitude": "number",
  "longitude": "number",
  "resolved": "boolean",
  "resolved_at": "ISODate | null",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

#### 5. backups
```json
{
  "_id": "ObjectId",
  "name": "string",
  "collections": ["string"],
  "total_documents": "integer",
  "size_bytes": "integer",
  "status": "string (completed, failed)",
  "created_by": "string",
  "completed_at": "ISODate",
  "data": {
    "users": [],
    "medical_profiles": [],
    "vital_signs": [],
    "alerts": []
  },
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

#### 6. personal_access_tokens (Sanctum)
```json
{
  "_id": "ObjectId",
  "tokenable_type": "string",
  "tokenable_id": "string",
  "name": "string",
  "token": "string (SHA-256 hash)",
  "abilities": ["string"],
  "last_used_at": "ISODate",
  "expires_at": "ISODate",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### Relaciones
- users.doctor_id -> users._id (doctor asignado)
- medical_profiles.user_id -> users._id
- vital_signs.user_id -> users._id
- alerts.user_id -> users._id
- personal_access_tokens.tokenable_id -> users._id

### Indices recomendados
- users: email (unique)
- vital_signs: user_id + recorded_at
- alerts: user_id + resolved
