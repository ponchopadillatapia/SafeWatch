<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Backup;
use App\Models\MedicalProfile;
use App\Models\User;
use App\Models\VitalSign;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    // List all backups
    public function index()
    {
        $backups = Backup::latest()->take(20)->get()->map(function ($b) {
            unset($b->data); // Don't send full data in list
            return $b;
        });

        return response()->json($backups);
    }

    // Create a new backup
    public function store(Request $request)
    {
        $collections = ['users', 'medical_profiles', 'vital_signs', 'alerts'];

        $data = [];
        $totalDocs = 0;

        // Users (without passwords)
        $users = User::all()->map(function ($u) {
            return collect($u->toArray())->except(['password', 'remember_token'])->all();
        });
        $data['users'] = $users->toArray();
        $totalDocs += $users->count();

        // Medical profiles
        $profiles = MedicalProfile::all();
        $data['medical_profiles'] = $profiles->toArray();
        $totalDocs += $profiles->count();

        // Vital signs
        $vitals = VitalSign::all();
        $data['vital_signs'] = $vitals->toArray();
        $totalDocs += $vitals->count();

        // Alerts
        $alerts = Alert::all();
        $data['alerts'] = $alerts->toArray();
        $totalDocs += $alerts->count();

        $sizeBytes = strlen(json_encode($data));

        $backup = Backup::create([
            'name' => 'Respaldo ' . now()->format('Y-m-d H:i'),
            'collections' => $collections,
            'total_documents' => $totalDocs,
            'size_bytes' => $sizeBytes,
            'status' => 'completed',
            'created_by' => $request->user()->name,
            'completed_at' => now(),
            'data' => $data,
        ]);

        // Return without the heavy data field
        $result = $backup->toArray();
        unset($result['data']);

        return response()->json([
            'status' => 'ok',
            'backup' => $result,
        ], 201);
    }

    // Download a backup as JSON
    public function download(Backup $backup)
    {
        if (!$backup->data) {
            return response()->json(['message' => 'Sin datos de respaldo.'], 404);
        }

        return response()->json($backup->data)
            ->header('Content-Disposition', 'attachment; filename="shieldtech-backup-' . $backup->created_at->format('Y-m-d-His') . '.json"');
    }

    // Restore from a backup
    public function restore(Backup $backup)
    {
        if (!$backup->data) {
            return response()->json(['message' => 'Sin datos para restaurar.'], 404);
        }

        $restored = 0;

        // Restore vital signs
        if (!empty($backup->data['vital_signs'])) {
            VitalSign::truncate();
            foreach ($backup->data['vital_signs'] as $v) {
                unset($v['_id']);
                VitalSign::create($v);
                $restored++;
            }
        }

        // Restore alerts
        if (!empty($backup->data['alerts'])) {
            Alert::truncate();
            foreach ($backup->data['alerts'] as $a) {
                unset($a['_id']);
                Alert::create($a);
                $restored++;
            }
        }

        // Restore medical profiles
        if (!empty($backup->data['medical_profiles'])) {
            MedicalProfile::truncate();
            foreach ($backup->data['medical_profiles'] as $p) {
                unset($p['_id']);
                MedicalProfile::create($p);
                $restored++;
            }
        }

        return response()->json([
            'status' => 'restored',
            'documents_restored' => $restored,
        ]);
    }

    // Delete a backup
    public function destroy(Backup $backup)
    {
        $backup->delete();
        return response()->json(['status' => 'deleted']);
    }

    // DB stats
    public function stats()
    {
        return response()->json([
            'users' => User::count(),
            'medical_profiles' => MedicalProfile::count(),
            'vital_signs' => VitalSign::count(),
            'alerts' => Alert::count(),
            'backups' => Backup::count(),
        ]);
    }
}
