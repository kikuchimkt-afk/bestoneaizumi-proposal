$pdfDir = Join-Path $PSScriptRoot "pdf"
$outputFile = Join-Path $PSScriptRoot "pdf_list.js"

# Check if pdf dir exists
if (-not (Test-Path $pdfDir)) {
    New-Item -ItemType Directory -Path $pdfDir | Out-Null
    Write-Host "Created 'pdf' directory. Please put your PDF files there." -ForegroundColor Yellow
}

# Get PDF files
$files = Get-ChildItem -Path $pdfDir -Filter *.pdf
$fileList = @()

foreach ($file in $files) {
    $fileList += "'$($file.Name)'"
}

# Generate JS content
$jsContent = "const PDF_FILES = [" + [string]::Join(", ", $fileList) + "];"

# Write to file (UTF8)
$jsContent | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "pdf_list.js has been updated with $($files.Count) files." -ForegroundColor Green
