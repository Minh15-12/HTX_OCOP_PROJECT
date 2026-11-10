<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnrichWebGisPolygonsSeeder extends Seeder
{
    /**
     * Cập nhật tọa độ đa giác WebGIS thực tế cho 6 Vùng trồng và 15 Thửa đất nông nghiệp HTX Tân Tiến
     * Tuân thủ chuẩn WGS-84 (Lat, Lng) & GeoJSON RFC 7946 (Lng, Lat)
     * Căn cứ: TCVN 12850:2019 và Quyết định 973/2001/QĐ-TCĐC
     */
    public function run(): void
    {
        // 1. Cập nhật Đa giác ranh giới Vùng sản xuất (Production Units)
        $unitPolygons = [
            'VT-DALAT-01' => [
                'lat' => 11.9501,
                'lng' => 108.4712,
                'polygon' => [
                    [11.9535, 108.4680],
                    [11.9542, 108.4735],
                    [11.9505, 108.4755],
                    [11.9465, 108.4740],
                    [11.9468, 108.4685],
                    [11.9500, 108.4670],
                ],
                'address' => 'Vùng chuyên canh Ớt Chuông Sweet Palermo Đỏ Hòn Bồ (Phường 12 - Đà Lạt)',
                'commune' => 'Phường 12',
                'district' => 'TP. Đà Lạt',
                'province' => 'Lâm Đồng',
            ],
            'VT-DASAR-02' => [
                'lat' => 11.9404,
                'lng' => 108.4583,
                'polygon' => [
                    [11.9440, 108.4545],
                    [11.9445, 108.4615],
                    [11.9395, 108.4620],
                    [11.9370, 108.4570],
                    [11.9390, 108.4540],
                ],
                'address' => 'Vùng trồng Ớt Chuông Sweet Palermo Vàng Đạ Sar (HTX Tân Tiến)',
                'commune' => 'Xã Đạ Sar',
                'district' => 'Huyện Lạc Dương',
                'province' => 'Lâm Đồng',
            ],
            'VT-TRAMHANH-03' => [
                'lat' => 11.8900,
                'lng' => 108.5300,
                'polygon' => [
                    [11.8935, 108.5265],
                    [11.8940, 108.5335],
                    [11.8890, 108.5340],
                    [11.8865, 108.5290],
                    [11.8885, 108.5260],
                ],
                'address' => 'Vùng Nông Nghiệp CNC Ớt Chuông Sweet Palermo Cầu Đất - Trạm Hành',
                'commune' => 'Xã Trạm Hành',
                'district' => 'TP. Đà Lạt',
                'province' => 'Lâm Đồng',
            ],
            'VT-TANUNG-04' => [
                'lat' => 11.9120,
                'lng' => 108.3650,
                'polygon' => [
                    [11.9150, 108.3620],
                    [11.9155, 108.3680],
                    [11.9110, 108.3685],
                    [11.9090, 108.3645],
                    [11.9110, 108.3615],
                ],
                'address' => 'Vùng Canh Tác Ớt Chuông Sweet Palermo Hữu Cơ Tà Nung (TP. Đà Lạt)',
                'commune' => 'Xã Tà Nung',
                'district' => 'TP. Đà Lạt',
                'province' => 'Lâm Đồng',
            ],
            'VT-LACDUONG-05' => [
                'lat' => 11.9850,
                'lng' => 108.4210,
                'polygon' => [
                    [11.9885, 108.4180],
                    [11.9890, 108.4240],
                    [11.9845, 108.4245],
                    [11.9820, 108.4205],
                    [11.9840, 108.4175],
                ],
                'address' => 'Vùng Chuyên Canh Ớt Chuông Sweet Palermo Giá Thể Lạc Dương',
                'commune' => 'Thị trấn Lạc Dương',
                'district' => 'Huyện Lạc Dương',
                'province' => 'Lâm Đồng',
            ],
            'VT-DONDUONG-06' => [
                'lat' => 11.8200,
                'lng' => 108.5600,
                'polygon' => [
                    [11.8235, 108.5570],
                    [11.8240, 108.5635],
                    [11.8190, 108.5640],
                    [11.8165, 108.5595],
                    [11.8185, 108.5565],
                ],
                'address' => 'Vùng Trồng Ớt Chuông Công Nghệ Cao Đơn Dương (Vùng Đệm)',
                'commune' => 'Xã Ka Đô',
                'district' => 'Huyện Đơn Dương',
                'province' => 'Lâm Đồng',
            ],
        ];

        foreach ($unitPolygons as $unitCode => $u) {
            $existingUnit = DB::table('production_units')->where('unit_code', $unitCode)->first();
            if ($existingUnit) {
                $location = json_decode($existingUnit->location ?? '{}', true) ?: [];
                $location['latitude'] = $u['lat'];
                $location['longitude'] = $u['lng'];
                $location['lat'] = $u['lat'];
                $location['lng'] = $u['lng'];
                $location['address'] = $u['address'];
                $location['commune'] = $u['commune'];
                $location['district'] = $u['district'];
                $location['province'] = $u['province'];
                $location['polygon_coordinates'] = $u['polygon'];

                DB::table('production_units')->where('unit_code', $unitCode)->update([
                    'location' => json_encode($location),
                    'updated_at' => now(),
                ]);
            }
        }

        // 2. Cập nhật Đa giác GeoJSON thực tế cho từng Thửa đất (Farm Plots)
        // Lưu ý: Chuẩn GeoJSON lưu dạng [Longitude, Latitude]
        $plotPolygons = [
            // VT-DALAT-01 (Hòn Bồ)
            'PLOT-TT-XV001-01' => [
                'coordinates' => [
                    [108.4685, 11.9530],
                    [108.4708, 11.9532],
                    [108.4706, 11.9512],
                    [108.4683, 11.9510],
                    [108.4685, 11.9530],
                ],
                'cadastral' => 'TB-P12-001',
                'sheet' => '12',
                'parcel' => '101',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.2,
                'yield_rate' => 5.2,
            ],
            'PLOT-TT-XV001-02' => [
                'coordinates' => [
                    [108.4712, 11.9533],
                    [108.4732, 11.9535],
                    [108.4734, 11.9515],
                    [108.4710, 11.9513],
                    [108.4712, 11.9533],
                ],
                'cadastral' => 'TB-P12-002',
                'sheet' => '12',
                'parcel' => '102',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.0,
                'yield_rate' => 5.0,
            ],
            'PLOT-TT-XV003-01' => [
                'coordinates' => [
                    [108.4686, 11.9508],
                    [108.4715, 11.9510],
                    [108.4713, 11.9492],
                    [108.4685, 11.9490],
                    [108.4686, 11.9508],
                ],
                'cadastral' => 'TB-P12-003',
                'sheet' => '12',
                'parcel' => '103',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.4,
                'yield_rate' => 5.5,
            ],
            'PLOT-TT-XV006-01' => [
                'coordinates' => [
                    [108.4718, 11.9510],
                    [108.4738, 11.9512],
                    [108.4735, 11.9495],
                    [108.4716, 11.9493],
                    [108.4718, 11.9510],
                ],
                'cadastral' => 'TB-P12-006',
                'sheet' => '12',
                'parcel' => '106',
                'greenhouse' => 'NET_HOUSE',
                'density' => 2.8,
                'yield_rate' => 4.8,
            ],
            'PLOT-TT-XV011-01' => [
                'coordinates' => [
                    [108.4688, 11.9488],
                    [108.4710, 11.9490],
                    [108.4708, 11.9472],
                    [108.4686, 11.9470],
                    [108.4688, 11.9488],
                ],
                'cadastral' => 'TB-P12-011',
                'sheet' => '12',
                'parcel' => '111',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.2,
                'yield_rate' => 5.1,
            ],
            'PLOT-TT-XV012-01' => [
                'coordinates' => [
                    [108.4712, 11.9490],
                    [108.4732, 11.9492],
                    [108.4730, 11.9474],
                    [108.4710, 11.9472],
                    [108.4712, 11.9490],
                ],
                'cadastral' => 'TB-P12-012',
                'sheet' => '12',
                'parcel' => '112',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.1,
                'yield_rate' => 5.0,
            ],
            'PLOT-TT-XV017-01' => [
                'coordinates' => [
                    [108.4690, 11.9469],
                    [108.4725, 11.9471],
                    [108.4722, 11.9455],
                    [108.4688, 11.9453],
                    [108.4690, 11.9469],
                ],
                'cadastral' => 'TB-P12-017',
                'sheet' => '12',
                'parcel' => '117',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.3,
                'yield_rate' => 5.3,
            ],

            // VT-DASAR-02 (Đạ Sar)
            'PLOT-TT-XV002-01' => [
                'coordinates' => [
                    [108.4552, 11.9435],
                    [108.4595, 11.9438],
                    [108.4592, 11.9410],
                    [108.4550, 11.9408],
                    [108.4552, 11.9435],
                ],
                'cadastral' => 'DS-LD-002',
                'sheet' => '05',
                'parcel' => '201',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.2,
                'yield_rate' => 5.2,
            ],
            'PLOT-TT-XV004-01' => [
                'coordinates' => [
                    [108.4555, 11.9405],
                    [108.4598, 11.9408],
                    [108.4595, 11.9382],
                    [108.4552, 11.9380],
                    [108.4555, 11.9405],
                ],
                'cadastral' => 'DS-LD-004',
                'sheet' => '05',
                'parcel' => '202',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.0,
                'yield_rate' => 5.0,
            ],

            // VT-DONDUONG-06 (Đơn Dương)
            'PLOT-TT-XV005-01' => [
                'coordinates' => [
                    [108.5575, 11.8230],
                    [108.5625, 11.8232],
                    [108.5622, 11.8200],
                    [108.5572, 11.8198],
                    [108.5575, 11.8230],
                ],
                'cadastral' => 'DD-KD-005',
                'sheet' => '08',
                'parcel' => '301',
                'greenhouse' => 'NET_HOUSE',
                'density' => 2.9,
                'yield_rate' => 4.9,
            ],

            // VT-TRAMHANH-03 (Cầu Đất - Trạm Hành)
            'PLOT-TT-XV007-01' => [
                'coordinates' => [
                    [108.5270, 11.8930],
                    [108.5310, 11.8932],
                    [108.5308, 11.8905],
                    [108.5268, 11.8903],
                    [108.5270, 11.8930],
                ],
                'cadastral' => 'CD-TH-007',
                'sheet' => '14',
                'parcel' => '401',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.2,
                'yield_rate' => 5.2,
            ],
            'PLOT-TT-XV013-01' => [
                'coordinates' => [
                    [108.5312, 11.8932],
                    [108.5332, 11.8933],
                    [108.5330, 11.8902],
                    [108.5310, 11.8900],
                    [108.5312, 11.8932],
                ],
                'cadastral' => 'CD-TH-013',
                'sheet' => '14',
                'parcel' => '402',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.1,
                'yield_rate' => 5.0,
            ],
            'PLOT-TT-XV015-01' => [
                'coordinates' => [
                    [108.5275, 11.8900],
                    [108.5325, 11.8902],
                    [108.5320, 11.8875],
                    [108.5272, 11.8873],
                    [108.5275, 11.8900],
                ],
                'cadastral' => 'CD-TH-015',
                'sheet' => '14',
                'parcel' => '403',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.3,
                'yield_rate' => 5.3,
            ],

            // VT-LACDUONG-05 (Lạc Dương)
            'PLOT-TT-XV014-01' => [
                'coordinates' => [
                    [108.4185, 11.9880],
                    [108.4235, 11.9882],
                    [108.4232, 11.9850],
                    [108.4182, 11.9848],
                    [108.4185, 11.9880],
                ],
                'cadastral' => 'LD-TT-014',
                'sheet' => '03',
                'parcel' => '501',
                'greenhouse' => 'HIGH_TECH_GREENHOUSE',
                'density' => 3.4,
                'yield_rate' => 5.4,
            ],

            // VT-TANUNG-04 (Tà Nung)
            'PLOT-TT-XV016-01' => [
                'coordinates' => [
                    [108.3625, 11.9145],
                    [108.3675, 11.9148],
                    [108.3672, 11.9115],
                    [108.3622, 11.9112],
                    [108.3625, 11.9145],
                ],
                'cadastral' => 'TN-DL-016',
                'sheet' => '09',
                'parcel' => '601',
                'greenhouse' => 'OPEN_FIELD',
                'density' => 2.5,
                'yield_rate' => 4.5,
            ],
        ];

        foreach ($plotPolygons as $plotCode => $p) {
            $geojson = [
                'type' => 'Polygon',
                'coordinates' => [$p['coordinates']],
            ];

            // Giả lập tọa độ trắc địa VN-2000 (Kinh tuyến trục Lâm Đồng 107.75) tương ứng
            $vn2000 = [];
            foreach ($p['coordinates'] as $idx => $pt) {
                $lng = $pt[0];
                $lat = $pt[1];
                // Ước lượng x (Northing ~ 1320000m) và y (Easting ~ 440000m)
                $x = round(1320000 + ($lat - 11.90) * 111000, 2);
                $y = round(440000 + ($lng - 108.40) * 105000, 2);
                $vn2000[] = [
                    'point_number' => $idx + 1,
                    'x' => $x,
                    'y' => $y,
                ];
            }

            DB::table('farm_plots')->where('plot_code', $plotCode)->update([
                'geometry_geojson' => json_encode($geojson),
                'vn2000_coordinates' => json_encode($vn2000),
                'national_cadastral_code' => $p['cadastral'],
                'land_sheet_number' => $p['sheet'],
                'land_parcel_number' => $p['parcel'],
                'greenhouse_type' => $p['greenhouse'],
                'planting_density_per_sqm' => $p['density'],
                'max_yield_rate_per_sqm' => $p['yield_rate'],
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Đã làm giàu đa giác WebGIS cho 6 Vùng sản xuất và 15 Thửa đất thành công!');
    }
}
