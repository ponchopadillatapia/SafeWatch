<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\MedicalProfile;
use App\Models\User;
use App\Models\VitalSign;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear collections
        User::truncate();
        MedicalProfile::truncate();
        VitalSign::truncate();
        Alert::truncate();

        // Load users from JSON
        $usersJson = json_decode(file_get_contents(database_path('json/users.json')), true);
        $userMap = [];

        foreach ($usersJson as $u) {
            $userData = [
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make($u['password']),
                'role' => $u['role'],
            ];
            $user = User::create($userData);
            $userMap[$u['email']] = $user;
        }

        // Assign doctor_id
        foreach ($usersJson as $u) {
            if (!empty($u['doctor_email']) && isset($userMap[$u['doctor_email']])) {
                $userMap[$u['email']]->update([
                    'doctor_id' => (string) $userMap[$u['doctor_email']]->_id,
                ]);
            }
        }

        // Load medical profiles from JSON
        $profilesJson = json_decode(file_get_contents(database_path('json/medical_profiles.json')), true);

        foreach ($profilesJson as $p) {
            $userEmail = $p['user_email'];
            unset($p['user_email']);

            if (isset($userMap[$userEmail])) {
                $p['user_id'] = (string) $userMap[$userEmail]->_id;
                if (!empty($p['privacy_accepted'])) {
                    $p['privacy_accepted_at'] = now();
                }
                MedicalProfile::create($p);
            }
        }

        // Generate vital signs for pacientes
        $now = now();
        foreach ($userMap as $email => $user) {
            if ($user->role !== 'paciente') continue;

            $count = $email === 'demo@shieldtech.com' ? 96 : 48;
            for ($i = $count; $i >= 0; $i--) {
                VitalSign::create([
                    'user_id' => (string) $user->_id,
                    'heart_rate' => rand(60, 100),
                    'blood_pressure_systolic' => rand(110, 135),
                    'blood_pressure_diastolic' => rand(65, 85),
                    'temperature' => round(rand(360, 375) / 10, 1),
                    'oxygen_saturation' => rand(94, 99),
                    'steps' => rand(0, 500),
                    'latitude' => 19.4326 + (rand(-100, 100) / 10000),
                    'longitude' => -99.1332 + (rand(-100, 100) / 10000),
                    'recorded_at' => $now->copy()->subMinutes($i * 30),
                ]);
            }
        }

        // Sample alerts for demo user
        $demo = $userMap['demo@shieldtech.com'];
        Alert::create([
            'user_id' => (string) $demo->_id,
            'type' => 'heart_rate',
            'severity' => 'high',
            'message' => 'Ritmo cardiaco elevado: 125 BPM',
            'latitude' => 19.4326,
            'longitude' => -99.1332,
        ]);

        Alert::create([
            'user_id' => (string) $demo->_id,
            'type' => 'sos',
            'severity' => 'critical',
            'message' => 'SOS activado por el usuario',
            'latitude' => 19.4330,
            'longitude' => -99.1335,
            'resolved' => true,
            'resolved_at' => $now->copy()->subHours(1),
        ]);

        $this->command->info('Base de datos MongoDB cargada desde archivos JSON.');
    }
}
