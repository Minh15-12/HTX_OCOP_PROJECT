import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('docs/htx-ocop-ui-v3 (1).html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'openOcopWizardNew' in line or 'ocopWiz' in line or 'function renderOcop' in line:
            print(f"{i+1}: {line.strip()[:100]}")
