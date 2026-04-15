<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
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

        return response()->json([
            'user' => $user,
            'latestVitals' => $latestVitals,
            'activeAlerts' => $activeAlerts,
            'todaySteps' => $todaySteps,
            'heartRateHistory' => $heartRateHistory,
        ]);
    }
}
