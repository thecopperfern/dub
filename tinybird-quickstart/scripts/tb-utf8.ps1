param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $TbArgs
)

[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"
chcp 65001 > $null

& tb @TbArgs
exit $LASTEXITCODE
