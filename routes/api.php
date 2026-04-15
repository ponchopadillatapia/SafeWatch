<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\MedicalProfileController;
use App\Http\Controllers\Api\VitalSignController;
use Illuminate\Support\Facades\Route;

// Auth público
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protegido con token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/vitals', [VitalSignController::class, 'index']);
    Route::post('/vitals', [VitalSignController::class, 'store']);

    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts/sos', [AlertController::class, 'sos']);
    Route::patch('/alerts/{alert}/resolve', [AlertController::class, 'resolve']);

    Route::get('/profile', [MedicalProfileController::class, 'show']);
    Route::put('/profile', [MedicalProfileController::class, 'update']);

    // Solo admin
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::patch('/admin/users/{user}/role', [AdminController::class, 'updateRole']);

        // Respaldos
        Route::get('/admin/backups', [BackupController::class, 'index']);
        Route::post('/admin/backups', [BackupController::class, 'store']);
        Route::get('/admin/backups/{backup}/download', [BackupController::class, 'download']);
        Route::post('/admin/backups/{backup}/restore', [BackupController::class, 'restore']);
        Route::delete('/admin/backups/{backup}', [BackupController::class, 'destroy']);
        Route::get('/admin/stats', [BackupController::class, 'stats']);
    });

    // Solo doctor
    Route::middleware('role:doctor')->prefix('doctor')->group(function () {
        Route::get('/patients', [DoctorController::class, 'patients']);
        Route::get('/patients/{patient}', [DoctorController::class, 'patientDetail']);
        Route::get('/unassigned', [DoctorController::class, 'unassigned']);
        Route::post('/assign', [DoctorController::class, 'assign']);
        Route::delete('/patients/{patient}/unassign', [DoctorController::class, 'unassign']);
    });
});
