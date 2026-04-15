<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users()
    {
        $users = User::with('medicalProfile')
            ->latest()
            ->paginate(20);

        // Add counts manually for MongoDB compatibility
        $users->getCollection()->transform(function ($user) {
            $user->alerts_count = $user->alerts()->count();
            $user->vital_signs_count = $user->vitalSigns()->count();
            return $user;
        });

        return response()->json($users);
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:paciente,doctor,admin',
        ]);

        $user->update($validated);

        return response()->json(['status' => 'updated', 'user' => $user]);
    }
}
