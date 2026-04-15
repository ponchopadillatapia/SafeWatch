<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medical_profiles', function (Blueprint $table) {
            // Datos personales extra
            $table->enum('gender', ['masculino', 'femenino', 'otro', 'prefiero_no_decir'])->nullable()->after('birth_date');
            $table->string('curp', 18)->nullable()->after('gender');
            $table->string('insurance_provider')->nullable()->after('curp');
            $table->string('insurance_number')->nullable()->after('insurance_provider');

            // Ubicación del hogar (GPS)
            $table->string('home_address')->nullable()->after('insurance_number');
            $table->decimal('home_latitude', 10, 7)->nullable()->after('home_address');
            $table->decimal('home_longitude', 10, 7)->nullable()->after('home_latitude');

            // Doctor familiar (opcional)
            $table->string('doctor_name')->nullable()->after('home_longitude');
            $table->string('doctor_phone')->nullable()->after('doctor_name');
            $table->string('doctor_specialty')->nullable()->after('doctor_phone');
            $table->string('doctor_hospital')->nullable()->after('doctor_specialty');

            // Segundo contacto de emergencia
            $table->string('emergency_contact2_name')->nullable()->after('emergency_contact_relation');
            $table->string('emergency_contact2_phone')->nullable()->after('emergency_contact2_name');
            $table->string('emergency_contact2_relation')->nullable()->after('emergency_contact2_phone');

            // Consentimiento de privacidad
            $table->boolean('privacy_accepted')->default(false)->after('notes');
            $table->timestamp('privacy_accepted_at')->nullable()->after('privacy_accepted');
        });
    }

    public function down(): void
    {
        Schema::table('medical_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'gender', 'curp', 'insurance_provider', 'insurance_number',
                'home_address', 'home_latitude', 'home_longitude',
                'doctor_name', 'doctor_phone', 'doctor_specialty', 'doctor_hospital',
                'emergency_contact2_name', 'emergency_contact2_phone', 'emergency_contact2_relation',
                'privacy_accepted', 'privacy_accepted_at',
            ]);
        });
    }
};
