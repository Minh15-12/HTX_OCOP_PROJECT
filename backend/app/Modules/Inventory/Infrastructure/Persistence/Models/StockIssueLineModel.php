<?php

namespace Modules\Inventory\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockIssueLineModel extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'stock_issue_lines';

    protected $fillable = [
        'stock_issue_id',
        'material_id',
        'quantity',
        'unit_price',
        'batch_code',
        'line_amount',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price' => 'decimal:2',
        'line_amount' => 'decimal:2',
    ];

    public function stockIssue(): BelongsTo
    {
        return $this->belongsTo(StockIssueModel::class, 'stock_issue_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(MaterialModel::class, 'material_id');
    }
}
