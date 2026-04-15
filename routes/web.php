<?php

use Illuminate\Support\Facades\Route;

// Todas las rutas las maneja React (SPA)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
