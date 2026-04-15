<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Backup extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'backups';

    protected $fillable = [
        'name', 'collections', 'total_documents', 'size_bytes',
        'status', 'created_by', 'completed_at', 'data',
    ];

    protected function casts(): array
    {
        return [
            'collections' => 'array',
            'completed_at' => 'datetime',
        ];
    }
}
