<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\VitalSign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $latestVitals = $user->vitalSigns()->latest('recorded_at')->first();
        $activeAlerts = $user->alerts()->active()->latest()->take(5)->get();
        $todaySteps = $user->vitalSigns()
            ->whereDate('recorded_at', today())
            ->max('steps') ?? 0;

        $heartRateHistory = $user->vitalSigns()
            ->whereNotNull('heart_rate')
            ->latest('recorded_at')
            ->take(24)
            ->get()
            ->reverse()
            ->values();

        return view('dashboard', compact(
            'user',
            'latestVitals',
            'activeAlerts',
            'todaySteps',
            'heartRateHistory'
        ));
    }

    public function vitalsData()
    {
        $user = Auth::user();
        $vitals = $user->vitalSigns()
            ->latest('recorded_at')
            ->take(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json($vitals);
    }
}
