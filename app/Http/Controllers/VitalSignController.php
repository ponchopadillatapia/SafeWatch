<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\VitalSign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VitalSignController extends Controller
{
    public function index()
    {
        $vitals = Auth::user()->vitalSigns()
            ->latest('recorded_at')
            ->paginate(20);

        return view('vitals.index', compact('vitals'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'heart_rate' => 'nullable|integer|min:20|max:250',
            'blood_pressure_systolic' => 'nullable|integer|min:60|max:250',
            'blood_pressure_diastolic' => 'nullable|integer|min:30|max:150',
            'temperature' => 'nullable|numeric|min:30|max:45',
            'oxygen_saturation' => 'nullable|integer|min:50|max:100',
            'steps' => 'nullable|integer|min:0',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['recorded_at'] = now();

        $vital = VitalSign::create($validated);

        // Check for abnormal values and create alerts
        $this->checkForAlerts($vital);

        if ($request->expectsJson()) {
            return response()->json(['status' => 'ok', 'vital' => $vital]);
        }

        return back()->with('success', 'Signos vitales registrados.');
    }

    private function checkForAlerts(VitalSign $vital): void
    {
        if ($vital->isHeartRateAbnormal()) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'heart_rate',
                'severity' => $vital->heart_rate > 150 || $vital->heart_rate < 40 ? 'critical' : 'high',
                'message' => "Ritmo cardíaco anormal: {$vital->heart_rate} BPM",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }

        if ($vital->isOxygenLow()) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'oxygen',
                'severity' => $vital->oxygen_saturation < 85 ? 'critical' : 'high',
                'message' => "Oxígeno bajo: {$vital->oxygen_saturation}%",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }

        if ($vital->isTemperatureAbnormal()) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'temperature',
                'severity' => $vital->temperature > 40 || $vital->temperature < 34 ? 'critical' : 'high',
                'message' => "Temperatura anormal: {$vital->temperature}°C",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }

        if ($vital->isBloodPressureAbnormal()) {
            Alert::create([
                'user_id' => $vital->user_id,
                'type' => 'blood_pressure',
                'severity' => $vital->blood_pressure_systolic > 180 ? 'critical' : 'high',
                'message' => "Presión arterial alta: {$vital->blood_pressure_systolic}/{$vital->blood_pressure_diastolic}",
                'latitude' => $vital->latitude,
                'longitude' => $vital->longitude,
            ]);
        }
    }
}
