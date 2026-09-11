<?php

return [
    'enabled' => env('AUDIT_ENABLED', true),
    'table' => 'audit_events',
    'actions' => [
        'AUTH_LOGIN' => 'User login',
        'AUTH_LOGOUT' => 'User logout',
        'TENANT_SWITCH' => 'Switched tenant cooperative',
        'WORKFLOW_TRANSITION' => 'Workflow status changed',
        'SENSITIVE_DATA_ACCESS' => 'Sensitive data accessed',
    ],
];
