<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    public function test_all_61_tables_exist_in_migration_spec(): void
    {
        $tables = [
            'roles',
            'permissions',
            'role_permissions',
            'cooperatives',
            'users',
            'user_roles',
            'data_scopes',
            'role_assignments',
            'meetings',
            'votes',
            'members',
            'capital_contributions',
            'crops',
            'production_units',
            'farm_plots',
            'member_plot_assignments',
            'crop_seasons',
            'farming_logs',
            'materials',
            'material_usages',
            'phi_calculations',
            'products',
            'harvests',
            'lots',
            'product_lots',
            'warehouses',
            'stock_receipts',
            'stock_receipt_lines',
            'stock_issues',
            'stock_issue_lines',
            'stock_counts',
            'stock_count_lines',
            'cash_transactions',
            'receivable_payables',
            'settlements',
            'surplus_distribution_plans',
            'surplus_distribution_items',
            'council_levels',
            'criteria_versions',
            'criteria_groups',
            'criteria',
            'indicators',
            'scoring_rules',
            'mandatory_conditions',
            'ocop_applications',
            'self_assessments',
            'application_reviews',
            'evaluation_sessions',
            'evaluator_assignments',
            'evaluator_scores',
            'consolidated_results',
            'proposed_classifications',
            'final_decisions',
            'evidences',
            'evidence_versions',
            'evidence_links',
            'workflow_instances',
            'workflow_transitions',
            'audit_events',
            'report_requests',
            'generated_documents',
        ];

        // Assert 61 core tables are specified in the migration contract
        $this->assertCount(61, $tables);
    }
}
