<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Backup;
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
        Backup::truncate();

        // --- 1. Load users from JSON ---
        $usersJson = json_decode(file_get_contents(database_path('json/users.json')), true);
        $userMap = [];

        foreach ($usersJson as $u) {
            $user = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make($u['password']),
                'role' => $u['role'],
            ]);
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

        // --- 2. Load medical profiles from JSON ---
        $profilesJson = json_decode(file_get_contents(database_path('json/medical_profiles.json')), true);

        foreach ($profilesJson as $p) {
            $email = $p['user_email'];
            unset($p['user_email']);
            if (isset($userMap[$email])) {
                $p['user_id'] = (string) $userMap[$email]->_id;
                if (!empty($p['privacy_accepted'])) {
                    $p['privacy_accepted_at'] = now();
                }
                MedicalProfile::create($p);
            }
        }

        // --- 3. Load vital signs from JSON ---
        $vitalsJson = json_decode(file_get_contents(database_path('json/vital_signs.json')), true);

        foreach ($vitalsJson as $v) {
            $email = $v['user_email'];
            unset($v['user_email']);
            if (isset($userMap[$email])) {
                $v['user_id'] = (string) $userMap[$email]->_id;
                VitalSign::create($v);
            }
        }

        // --- 4. Load alerts from JSON ---
        $alertsJson = json_decode(file_get_contents(database_path('json/alerts.json')), true);

        foreach ($alertsJson as $a) {
            $email = $a['user_email'];
            unset($a['user_email']);
            if (isset($userMap[$email])) {
                $a['user_id'] = (string) $userMap[$email]->_id;
                if (!empty($a['resolved'])) {
                    $a['resolved_at'] = now()->subHours(1);
                }
                Alert::create($a);
            }
        }

        $this->command->info('Base de datos MongoDB cargada desde archivos JSON.');
        $this->command->info('  - users.json: ' . count($usersJson) . ' usuarios');
        $this->command->info('  - medical_profiles.json: ' . count($profilesJson) . ' perfiles');
        $this->command->info('  - vital_signs.json: ' . count($vitalsJson) . ' signos vitales');
        $this->command->info('  - alerts.json: ' . count($alertsJson) . ' alertas');
    }
}
