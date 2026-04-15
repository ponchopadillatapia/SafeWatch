<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MedicalProfileController extends Controller
{
    public function show(Request $request)
    {
        $profile = $request->user()->medicalProfile ?? $request->user()->medicalProfile()->create();
        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'gender' => 'nullable|in:masculino,femenino,otro,prefiero_no_decir',
            'curp' => 'nullable|string|size:18',
            'allergies' => 'nullable|string|max:1000',
            'chronic_conditions' => 'nullable|string|max:1000',
            'medications' => 'nullable|string|max:1000',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'emergency_contact2_name' => 'nullable|string|max:255',
            'emergency_contact2_phone' => 'nullable|string|max:20',
            'emergency_contact2_relation' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date|before:today',
            'height' => 'nullable|numeric|min:30|max:300',
            'weight' => 'nullable|numeric|min:1|max:500',
            'insurance_provider' => 'nullable|string|max:255',
            'insurance_number' => 'nullable|string|max:50',
            'home_address' => 'nullable|string|max:500',
            'home_latitude' => 'nullable|numeric|between:-90,90',
            'home_longitude' => 'nullable|numeric|between:-180,180',
            'doctor_name' => 'nullable|string|max:255',
            'doctor_phone' => 'nullable|string|max:20',
            'doctor_specialty' => 'nullable|string|max:100',
            'doctor_hospital' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'privacy_accepted' => 'nullable|boolean',
        ]);

        if ($request->boolean('privacy_accepted')) {
            $validated['privacy_accepted'] = true;
            $validated['privacy_accepted_at'] = now();
        }

        $profile = $request->user()->medicalProfile ?? $request->user()->medicalProfile()->create();
        $profile->update($validated);

        return response()->json(['status' => 'updated', 'profile' => $profile]);
    }
}
