$log = "d:\Claude-code-app\clay-book\setup-autostart-log.txt"
"[$(Get-Date)] 시작" | Out-File $log -Encoding utf8

try {
  $action = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument '/c start /min "클레이 도감 서버" "d:\Claude-code-app\clay-book\start-claybook.bat"'

  $trigger = New-ScheduledTaskTrigger -AtLogOn -User "notebook205"
  $trigger.Delay = "PT30S"

  $settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Seconds 0) `
    -MultipleInstances IgnoreNew

  $principal = New-ScheduledTaskPrincipal `
    -UserId "notebook205" `
    -LogonType Interactive `
    -RunLevel Highest

  Register-ScheduledTask `
    -TaskName "ClayBook Server" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "클레이 도감 Next.js 서버 자동 시작" `
    -Force

  "성공: 작업 스케줄러 등록 완료" | Out-File $log -Append -Encoding utf8
  Write-Host "완료!" -ForegroundColor Green

} catch {
  "실패: $_" | Out-File $log -Append -Encoding utf8
  Write-Host "오류: $_" -ForegroundColor Red
}

"[$(Get-Date)] 종료" | Out-File $log -Append -Encoding utf8
Write-Host "로그 파일: $log"
pause
