<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('events')->insert([
            [
                'title' => 'Seminar Teknologi Masa Depan',
                'description' => 'Bergabunglah dengan kami untuk mengeksplorasi tren teknologi terbaru yang akan membentuk masa depan. Pembicara ahli dari berbagai industri akan berbagi wawasan mereka.',
                'date' => Carbon::now()->addDays(7)->toDateString(),
                'time' => '09:00:00',
                'location' => 'Auditorium Utama, Kampus Ganesha',
                'organizer' => 'Himpunan Mahasiswa Informatika',
                'price' => 50000,
                'image_url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070',
                'bank_name' => 'Bank BNI',
                'account_number' => '1234567890',
                'account_holder' => 'Himpunan Mahasiswa Informatika',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Workshop Desain Grafis Kreatif',
                'description' => 'Pelajari dasar-dasar desain grafis dan cara menggunakan alat standar industri untuk membuat visual yang memukau. Cocok untuk pemula.',
                'date' => Carbon::now()->addDays(14)->toDateString(),
                'time' => '13:00:00',
                'location' => 'Lab Komputer 3, Gedung B',
                'organizer' => 'Unit Kegiatan Mahasiswa Seni Rupa',
                'price' => 35000,
                'image_url' => 'https://images.unsplash.com/photo-1626785774573-4b7993143a42?auto=format&fit=crop&q=80&w=2070',
                'bank_name' => 'Bank Mandiri',
                'account_number' => '1234567891',
                'account_holder' => 'UKM Seni Rupa',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Konser Musik Kampus: Ganesha Harmony',
                'description' => 'Malam penuh musik dan hiburan yang menampilkan bakat-bakat terbaik dari mahasiswa universitas. Jangan lewatkan penampilan spesial dari band tamu!',
                'date' => Carbon::now()->addDays(21)->toDateString(),
                'time' => '19:00:00',
                'location' => 'Lapangan Terbuka Ganesha',
                'organizer' => 'Badan Eksekutif Mahasiswa',
                'price' => 75000,
                'image_url' => 'https://images.unsplash.com/photo-1459749411177-287ce63e3ba6?auto=format&fit=crop&q=80&w=2070',
                'bank_name' => 'Bank BCA',
                'account_number' => '1234567892',
                'account_holder' => 'BEM Ganesha',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Lomba Coding Hackathon 2024',
                'description' => 'Tantang diri Anda dalam kompetisi coding 24 jam ini. Bangun solusi inovatif untuk masalah dunia nyata dan menangkan hadiah menarik.',
                'date' => Carbon::now()->addDays(30)->toDateString(),
                'time' => '08:00:00',
                'location' => 'Co-working Space, Gedung Inovasi',
                'organizer' => 'Komunitas Programmer Ganesha',
                'price' => 25000,
                'image_url' => 'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=2070',
                'bank_name' => 'Bank Jago',
                'account_number' => '1234567893',
                'account_holder' => 'Komunitas Programmer',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
