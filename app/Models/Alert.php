<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Alert extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'alerts';

    protected $fillable = [
        'user_id', 'type', 'severity', 'message',
        'latitude', 'longitude', 'resolved', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'resolved' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('resolved', '!=', true);
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }
}
