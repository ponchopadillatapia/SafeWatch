<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class MedicalProfile extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'medical_profiles';

    protected $fillable = [
        'user_id', 'blood_type', 'allergies', 'chronic_conditions', 'medications',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
        'emergency_contact2_name', 'emergency_contact2_phone', 'emergency_contact2_relation',
        'birth_date', 'gender', 'curp', 'insurance_provider', 'insurance_number',
        'home_address', 'home_latitude', 'home_longitude',
        'doctor_name', 'doctor_phone', 'doctor_specialty', 'doctor_hospital',
        'height', 'weight', 'notes', 'privacy_accepted', 'privacy_accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'privacy_accepted' => 'boolean',
            'privacy_accepted_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
