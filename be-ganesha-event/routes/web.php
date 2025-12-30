<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Debug route to check GD extension (temporary for Railway verification)
Route::get('/check-gd', function () {
    $extensions = get_loaded_extensions();
    $hasGD = extension_loaded('gd');
    
    return response()->json([
        'gd_installed' => $hasGD,
        'gd_info' => $hasGD ? gd_info() : 'GD not installed',
        'php_version' => phpversion(),
        'all_extensions' => $extensions
    ]);
});
