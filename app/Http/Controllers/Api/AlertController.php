<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $alerts = $request->user()->alerts()
            ->latest()
            ->paginate(20);

        return response()->json($alerts);
    }

    public function sos(Request $request)
    {
        $alert = Alert::create([
            'user_id' => (string) $request->user()->_id,
            'type' => 'sos',
            'severity' => 'critical',
            'message' => 'SOS activado por el usuario',
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
        ]);

        return response()->json(['status' => 'sos_sent', 'alert' => $alert], 201);
    }

    public function resolve(Alert $alert, Request $request)
    {
        if ($alert->user_id !== (string) $request->user()->_id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $alert->update([
            'resolved' => true,
            'resolved_at' => now(),
        ]);

        return response()->json(['status' => 'resolved', 'alert' => $alert]);
    }
}
