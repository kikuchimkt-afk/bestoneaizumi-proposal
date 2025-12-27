[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$outputFile = Join-Path $PSScriptRoot "logo_list.js"

# Find directory
$logoDirObj = Get-ChildItem -Path $PSScriptRoot -Directory | Where-Object { $_.Name -match "ロゴ|logo" } | Select-Object -First 1

if ($logoDirObj) {
    $logoDir = $logoDirObj.FullName
    $logoDirName = $logoDirObj.Name
}
else {
    # Fallback absolute
    $logoDir = Join-Path $PSScriptRoot "ロゴ"
    $logoDirName = "ロゴ"
}

Write-Host "Using Logo Dir: $logoDirName"

# Check existence
if (-not (Test-Path $logoDir)) {
    Write-Host "Logo directory not found." -ForegroundColor Red
    exit 1
}

# Image files
$files = Get-ChildItem -Path $logoDir | Where-Object { $_.Name -match "\.(png|jpg|jpeg|gif|svg)$" }

$fileList = @()
foreach ($file in $files) {
    $fileList += "'$($file.Name)'"
}

# Write JS
$jsContent = "const LOGO_FILES = [" + [string]::Join(", ", $fileList) + "];"
$jsContent | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "logo_list.js updated with $($files.Count) files." -ForegroundColor Green
