<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function patients(Request $request)
    {
        $patients = User::where('doctor_id', (string) $request->user()->_id)
            ->where('role', 'paciente')
            ->with(['medicalProfile', 'latestVitals'])
            ->get()
            ->map(function ($patient) {
                $activeCount = $patient->alerts()->where('resolved', '!=', true)->count();
                $patient->active_alerts_count = $activeCount;
                $v = $patient->latestVitals;
                $patient->status = 'normal';
                if ($v) {
                    if ($v->isHeartRateAbnormal() || $v->isOxygenLow() || $v->isTemperatureAbnormal() || $v->isBloodPressureAbnormal()) {
                        $patient->status = 'alerta';
                    }
                }
                return $patient;
            });

        return response()->json($patients);
    }

    public function patientDetail(Request $request, User $patient)
    {
        if ((string) $patient->doctor_id !== (string) $request->user()->_id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $patient->load('medicalProfile');

        $vitals = $patient->vitalSigns()
            ->latest('recorded_at')
            ->take(50)
            ->get()
            ->reverse()
            ->values();

        $latestVitals = $patient->vitalSigns()->latest('recorded_at')->first();

        $activeAlerts = $patient->alerts()
            ->where('resolved', '!=', true)
            ->latest()
            ->take(10)
            ->get();

        $todaySteps = $patient->vitalSigns()
            ->whereDate('recorded_at', today())
            ->max('steps') ?? 0;

        return response()->json([
            'patient' => $patient,
            'vitals' => $vitals,
            'latestVitals' => $latestVitals,
            'activeAlerts' => $activeAlerts,
            'todaySteps' => $todaySteps,
        ]);
    }

    public function unassigned()
    {
        $patients = User::where('role', 'paciente')
            ->whereNull('doctor_id')
            ->get(['name', 'email']);

        return response()->json($patients);
    }

    public function assign(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|string',
        ]);

        $patient = User::where('_id', $validated['patient_id'])
            ->where('role', 'paciente')
            ->firstOrFail();

        $patient->update(['doctor_id' => (string) $request->user()->_id]);

        return response()->json(['status' => 'assigned', 'patient' => $patient]);
    }

    public function unassign(Request $request, User $patient)
    {
        if ((string) $patient->doctor_id !== (string) $request->user()->_id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $patient->update(['doctor_id' => null]);

        return response()->json(['status' => 'unassigned']);
    }
}
