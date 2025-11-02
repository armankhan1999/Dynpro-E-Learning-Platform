# PowerShell script to remove ModernDashboardLayout wrappers from all page files
# This fixes the layout issue where sidebar was re-rendering on every page

Write-Host "Starting to remove ModernDashboardLayout wrappers..." -ForegroundColor Green

$files = @(
    "frontend\app\admin\announcements\page.tsx",
    "frontend\app\admin\audit-logs\page.tsx",
    "frontend\app\admin\categories\page.tsx",
    "frontend\app\admin\certificates\page.tsx",
    "frontend\app\admin\courses\page.tsx",
    "frontend\app\admin\learning-paths\page.tsx",
    "frontend\app\admin\page.tsx",
    "frontend\app\admin\reports\page.tsx",
    "frontend\app\admin\settings\page.tsx",
    "frontend\app\admin\users\page.tsx",
    "frontend\app\assessments\[id]\take\page.tsx",
    "frontend\app\assignments\[id]\submit\page.tsx",
    "frontend\app\assignments\[id]\view\page.tsx",
    "frontend\app\calendar\page.tsx",
    "frontend\app\courses\[id]\edit\page.tsx",
    "frontend\app\courses\[id]\modules\page.tsx",
    "frontend\app\courses\[id]\students\page.tsx",
    "frontend\app\courses\create\page.tsx",
    "frontend\app\courses\page.tsx",
    "frontend\app\dashboard\achievements\page.tsx",
    "frontend\app\dashboard\analytics\page.tsx",
    "frontend\app\dashboard\certificates\page.tsx",
    "frontend\app\discussions\[id]\page.tsx",
    "frontend\app\discussions\create\page.tsx",
    "frontend\app\discussions\my-posts\page.tsx",
    "frontend\app\discussions\page.tsx",
    "frontend\app\instructor\assessments\page.tsx",
    "frontend\app\instructor\content\page.tsx",
    "frontend\app\instructor\courses\page.tsx",
    "frontend\app\instructor\page.tsx",
    "frontend\app\instructor\reports\page.tsx",
    "frontend\app\instructor\students\page.tsx",
    "frontend\app\leaderboard\page.tsx",
    "frontend\app\learn\[contentId]\page.tsx",
    "frontend\app\learn\document\[id]\page.tsx",
    "frontend\app\learn\video\[id]\page.tsx",
    "frontend\app\profile\[userId]\page.tsx",
    "frontend\app\profile\edit\page.tsx",
    "frontend\app\profile\page.tsx",
    "frontend\app\profile\settings\page.tsx"
)

$count = 0
foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        
        # Remove the import statement
        $content = $content -replace "import ModernDashboardLayout from '@/components/layout/modern-dashboard-layout'\r?\n", ""
        
        # Add ContentLoader import if not present
        if ($content -notmatch "import ContentLoader") {
            $content = $content -replace "(import.*from '@/lib/auth-context')", "`$1`nimport ContentLoader from '@/components/ui/content-loader'"
        }
        
        # Remove opening tag: <ModernDashboardLayout>
        $content = $content -replace "\s*<ModernDashboardLayout>\r?\n", ""
        
        # Remove closing tag: </ModernDashboardLayout>
        $content = $content -replace "\s*</ModernDashboardLayout>\r?\n", ""
        
        # Save the file
        Set-Content -Path $fullPath -Value $content -NoNewline
        
        $count++
        Write-Host "  ✓ Fixed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $fullPath" -ForegroundColor Red
    }
}

Write-Host "`nCompleted! Fixed $count files." -ForegroundColor Green
Write-Host "All pages now use the layout.tsx hierarchy instead of wrapping themselves." -ForegroundColor Cyan
