<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlertController extends Controller
{
    public function index()
    {
        $alerts = Auth::user()->alerts()
            ->latest()
            ->paginate(20);

        return view('alerts.index', compact('alerts'));
    }

    public function sos(Request $request)
    {
        $alert = Alert::create([
            'user_id' => Auth::id(),
            'type' => 'sos',
            'severity' => 'critical',
            'message' => 'SOS activado por el usuario',
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
        ]);

        if ($request->expectsJson()) {
            return response()->json(['status' => 'sos_sent', 'alert' => $alert]);
        }

        return back()->with('success', 'Alerta SOS enviada. Contacto de emergencia notificado.');
    }

    public function resolve(Alert $alert)
    {
        abort_unless($alert->user_id === Auth::id(), 403);

        $alert->update([
            'resolved' => true,
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Alerta resuelta.');
    }
}
